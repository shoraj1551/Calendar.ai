# PWA Icons Setup Guide

## Quick Start: Generate Icons Online

The easiest way to create all required PWA icons:

### Option 1: RealFaviconGenerator (Recommended)

1. Go to https://realfavicongenerator.net/
2. Upload your logo (512x512 PNG recommended)
3. Configure settings:
   - iOS: Choose background color
   - Android: Choose theme color (#3b82f6 - blue)
   - Windows: Choose tile color
4. Click "Generate favicons"
5. Download the package
6. Extract to `public/` folder

### Option 2: PWA Asset Generator

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your 512x512 logo
3. Select "Generate"
4. Download all sizes
5. Place in `public/icons/` folder

### Option 3: Favicon.io

1. Go to https://favicon.io/favicon-converter/
2. Upload your logo
3. Download the package
4. Extract icons to `public/` folder

## Required Icon Sizes

Your PWA needs these icon sizes:

| Size | Purpose | Filename |
|------|---------|----------|
| 192x192 | Android home screen | `icon-192.png` |
| 512x512 | Android splash screen | `icon-512.png` |
| 180x180 | iOS home screen | `apple-touch-icon.png` |
| 32x32 | Browser favicon | `favicon-32x32.png` |
| 16x16 | Browser favicon | `favicon-16x16.png` |

## Manual Creation (If you have design software)

### Using Figma/Photoshop/Illustrator

1. **Create base icon** (512x512):
   - Simple, recognizable design
   - High contrast
   - Works at small sizes
   - Represents your brand

2. **Export multiple sizes**:
   - 512x512 → `icon-512.png`
   - 192x192 → `icon-192.png`
   - 180x180 → `apple-touch-icon.png`
   - 32x32 → `favicon-32x32.png`
   - 16x16 → `favicon-16x16.png`

3. **Place in public folder**:
   ```
   public/
   ├── icon-192.png
   ├── icon-512.png
   ├── apple-touch-icon.png
   ├── favicon-32x32.png
   ├── favicon-16x16.png
   └── favicon.ico
   ```

## Design Guidelines

### Best Practices

✅ **DO**:
- Use simple, bold shapes
- High contrast colors
- Recognizable at small sizes
- Consistent with brand
- Square format (1:1 ratio)
- PNG format with transparency

❌ **DON'T**:
- Use thin lines (won't show at small sizes)
- Include text (hard to read)
- Use complex gradients
- Make it too detailed

### Color Recommendations

For Calendar.ai, use:
- **Primary**: #3b82f6 (Blue)
- **Background**: #ffffff (White)
- **Accent**: #1e40af (Dark Blue)

### Icon Ideas for Calendar.ai

1. **Calendar icon** with AI spark
2. **Letter "C"** in modern font
3. **Calendar grid** with checkmark
4. **Clock + Calendar** combination
5. **Abstract calendar** shape

## Quick Icon Template

If you need a placeholder, here's a simple design:

```
Background: Blue (#3b82f6)
Icon: White calendar grid
Size: 512x512
Format: PNG
```

## Using AI to Generate Icons

### DALL-E / Midjourney Prompt

```
Create a modern, minimalist app icon for a calendar application.
Square format, 512x512 pixels.
Blue and white color scheme.
Simple calendar grid design.
Flat design style, no shadows.
Professional and clean.
```

### Canva Template

1. Go to Canva.com
2. Create custom size: 512x512
3. Search templates: "app icon"
4. Customize with your colors
5. Download as PNG

## After Creating Icons

### 1. Place Icons in Public Folder

```
public/
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── favicon.ico
└── manifest.json (already created)
```

### 2. Update manifest.json

Already configured in `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3. Add to HTML Head

Update `src/app/layout.tsx`:

```tsx
export const metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
```

### 4. Test Icons

After deployment:

**On Mobile**:
1. Visit your site
2. Add to home screen
3. Check if icon appears correctly

**On Desktop**:
1. Check browser tab favicon
2. Check bookmark icon

## Verification Checklist

- [ ] Created 512x512 base icon
- [ ] Generated all required sizes
- [ ] Placed icons in `public/` folder
- [ ] Updated `manifest.json`
- [ ] Tested on mobile device
- [ ] Icon shows in browser tab
- [ ] Icon shows when installed as PWA

## Tools & Resources

### Icon Generators
- https://realfavicongenerator.net/ (Best all-in-one)
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

### Design Tools
- Canva (Free, easy): https://canva.com
- Figma (Professional): https://figma.com
- GIMP (Free Photoshop alternative): https://gimp.org

### Icon Inspiration
- https://dribbble.com/search/app-icon
- https://www.behance.net/search/projects?search=app%20icon
- https://www.iconfinder.com/

## Quick Placeholder Icons

If you need to deploy NOW and create proper icons later:

1. Use a simple colored square:
   - 512x512 blue square (#3b82f6)
   - White "C" letter in center
   - Export as PNG

2. Generate all sizes from that
3. Deploy with placeholder
4. Update with proper icons later

---

## 🎨 Your Icons Are Ready!

Once you have your icons:
1. Place them in `public/` folder
2. Commit to git
3. Push to GitHub
4. Vercel automatically deploys
5. Test PWA installation

**Your app will now have a professional icon when installed!** 📱

---

## Need Help?

If you want me to generate a simple placeholder icon for you, let me know your preferred:
- Color scheme
- Style (modern, minimal, bold, etc.)
- Any specific elements (calendar, checkmark, etc.)
