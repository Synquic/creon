import dotenv from 'dotenv';
import OpenAI from 'openai';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from "node-cache";
import { logger } from '../index';

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const urlCache = new NodeCache({ stdTTL: 86400 }); // 86400 seconds = 1 day

export const fetchResponse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { url } = req.body || {};
        if (!url) {
            res.status(400).json({
                success: false,
                message: 'Missing product URL in request body.'
            });
            return;
        }

        // Check cache first
        if (urlCache.has(url)) {
          const cached = urlCache.get(url);
          if (cached) {
            res.status(200).json({ success: true, message: 'From cache', data: cached });
            return;
          }
        }    

        // Fetch the HTML content from the URL
        let html = '';
        try {
            const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            html = response.data;
        } catch (err) {
            res.status(502).json({
                success: false,
                message: 'Failed to fetch product page HTML.'
            });
            return;
        }
        logger.info('Fetched HTML length:', html.length);


    // Use cheerio to extract the <body> HTML
    const $ = cheerio.load(html);
    const mainContent = $('body').html() || html;
    // Optionally log the main content length
    logger.info('Main content length:', mainContent.length);
    // Divide main content into 4 parts, send 2nd and 3rd parts only
    const partLength = Math.ceil(mainContent.length / 4);
    const mainContentPart = mainContent.slice(partLength, partLength * 3);
    logger.info ('Sending part length:', mainContentPart.length);


        // Compose a strict system and user prompt for the LLM
        const systemMessage = `You are a web extraction agent. Given the HTML of a product page, extract and return ONLY a valid JSON object with the following fields: productTitle, productImage, price, currency (in this format USD, INR, EUR, GBP, CAD, AUD), productCode(for url like garnier-face-serum max 15 characters, should be words separated by -) and productDescription (you create a short description). Do NOT provide any explanation, markdown, or apology. If you cannot extract the data, return an empty JSON object: {}.`;
        const userMessage = `Extract product data from the following HTML.\n\nHTML:\n${mainContentPart}\n\nReturn ONLY a JSON object with these fields: productTitle, productImage, price, currency, productCode and productDescription.`;

        const completion = await client.chat.completions.create({
            model: 'o4-mini',
            messages: [
                { role: 'system', content: systemMessage }, 
                { role: 'user', content: userMessage },
            ],
            max_completion_tokens: 15000
        });

        const text = completion.choices?.[0]?.message?.content || '';
        if (!text) {
            res.status(502).json({
                success: false,
                message: 'Empty response from OpenAI'
            });
            return;
        }

        // Try to parse the response as JSON, fallback to raw text
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = text.trim();
        }

        urlCache.set(url, parsed);  // cache the result
        res.status(200).json({
            success: true,
            message: 'Product data extracted successfully',
            data: parsed,
            insights: {
            model: completion.model,
            usage: completion.usage || null,
            response: text
            }
        });
    } catch (error) {
        logger.error('Fetch response error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
