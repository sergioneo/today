# PWA Icons

To create proper PWA icons for your app, you need to add:

- `icon-192.png` - 192x192px icon
- `icon-512.png` - 512x512px icon

## Quick Icon Generation

### Option 1: Use a Design Tool
1. Create a 512x512px image with your logo/design
2. Use a sun emoji ☀️ or similar on a gradient background
3. Export as PNG
4. Resize to create 192x192 version

### Option 2: Online Icon Generator
1. Visit [PWA Asset Generator](https://www.pwabuilder.com/)
2. Upload a square image (1024x1024 recommended)
3. Download the generated icons
4. Place in this directory

### Option 3: Simple Emoji Icon
Create a simple HTML file and screenshot it:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            font-size: 300px;
        }
    </style>
</head>
<body>☀️</body>
</html>
```

Then screenshot and crop to 512x512px.

## Current Status

The app will work without icons, but they improve the install experience on mobile devices.
