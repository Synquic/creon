"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTheme = exports.getPublicTheme = exports.updateTheme = exports.getUserTheme = void 0;
const Theme_1 = require("../models/Theme");
const getUserTheme = async (req, res) => {
    try {
        const userId = req.user?.id;
        let theme = await Theme_1.Theme.findOne({ userId });
        if (!theme) {
            theme = await Theme_1.Theme.create({ userId });
        }
        res.json({
            success: true,
            data: { theme }
        });
    }
    catch (error) {
        console.error('Get user theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getUserTheme = getUserTheme;
const updateTheme = async (req, res) => {
    try {
        const userId = req.user?.id;
        const themeData = req.body;
        const allowedFields = [
            'backgroundColor', 'primaryColor', 'secondaryColor', 'textColor', 'accentColor',
            'fontFamily', 'fontSize', 'fontWeight',
            'buttonStyle', 'buttonShadow', 'buttonBorderWidth', 'buttonAnimation',
            'profileImageShape', 'profileImageSize', 'linkSpacing', 'maxWidth',
            'backgroundGradient', 'gradientDirection', 'backdropBlur', 'hideBranding',
            'customCss'
        ];
        const updateData = {};
        for (const field of allowedFields) {
            if (themeData.hasOwnProperty(field)) {
                updateData[field] = themeData[field];
            }
        }
        const theme = await Theme_1.Theme.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true, runValidators: true });
        res.json({
            success: true,
            message: 'Theme updated successfully',
            data: { theme }
        });
    }
    catch (error) {
        console.error('Update theme error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Invalid theme data',
                errors: error.errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateTheme = updateTheme;
const getPublicTheme = async (req, res) => {
    try {
        const { userId } = req.params;
        const theme = await Theme_1.Theme.findOne({ userId });
        const defaultTheme = {
            backgroundColor: '#ffffff',
            primaryColor: '#16a34a',
            secondaryColor: '#15803d',
            textColor: '#1f2937',
            accentColor: '#3b82f6',
            fontFamily: 'Inter',
            fontSize: 'medium',
            fontWeight: 'normal',
            buttonStyle: 'rounded',
            buttonShadow: true,
            buttonBorderWidth: 0,
            buttonAnimation: 'hover-scale',
            profileImageShape: 'circle',
            profileImageSize: 'medium',
            linkSpacing: 'normal',
            maxWidth: 'normal',
            backgroundGradient: false,
            gradientDirection: 'vertical',
            backdropBlur: false,
            hideBranding: false
        };
        res.json({
            success: true,
            data: {
                theme: theme || defaultTheme
            }
        });
    }
    catch (error) {
        console.error('Get public theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getPublicTheme = getPublicTheme;
const resetTheme = async (req, res) => {
    try {
        const userId = req.user?.id;
        await Theme_1.Theme.findOneAndDelete({ userId });
        const theme = await Theme_1.Theme.create({ userId });
        res.json({
            success: true,
            message: 'Theme reset to default successfully',
            data: { theme }
        });
    }
    catch (error) {
        console.error('Reset theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.resetTheme = resetTheme;
//# sourceMappingURL=themeController.js.map