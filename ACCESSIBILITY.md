# Accessibility Features

Substance Scrubber is designed to be accessible to all users, including those who rely on assistive technologies like screen readers or keyboard-only navigation.

## Keyboard Navigation

### Global Shortcuts

The following keyboard shortcuts work throughout the application:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+O` | Open image file |
| `Ctrl/Cmd+S` | Save anonymized image |
| `Ctrl/Cmd+R` | Rotate image 90° clockwise |
| `B` | Switch to Blur mode |
| `P` | Switch to Paint mode |
| `U` | Switch to Undo mode |
| `1` | Select Round brush |
| `2` | Select Rectangle tool |
| `3` | Select Tap tool |
| `[` | Decrease brush size |
| `]` | Increase brush size |
| `?` or `F1` | Open help/about dialog |
| `Esc` | Close open dialog |
| `Tab` | Navigate between interactive elements |
| `Shift+Tab` | Navigate backwards between elements |
| `Enter` or `Space` | Activate focused element |

### Skip Link

A "Skip to image editor" link appears when you press `Tab` from the top of the page, allowing keyboard users to jump directly to the main canvas.

### Focus Management

- All interactive elements are keyboard-accessible
- Focus indicators clearly show which element is active
- Modal dialogs trap focus, preventing keyboard navigation from leaving the dialog
- Focus is automatically restored when closing dialogs

## Screen Reader Support

### ARIA Labels and Descriptions

All interactive elements have descriptive ARIA labels:

- Buttons describe their action (e.g., "Save anonymized image")
- Form controls indicate their purpose
- Sliders announce current values
- Canvas has descriptive label explaining its purpose

### Live Regions

Status updates are announced to screen readers via ARIA live regions:

- Image loading status
- Save confirmation
- Brush size and blur radius changes
- Mode switching (blur/paint/undo)
- Error messages (announced assertively)
- Network status warnings

### Modal Dialogs

Modal dialogs (About, EXIF data) implement proper ARIA attributes:

- `role="dialog"`
- `aria-modal="true"` when open
- `aria-labelledby` references dialog title
- `aria-describedby` references dialog description
- Background content hidden with `aria-hidden` when modal is open

## Visual Accessibility

### Color Contrast

All text and interactive elements meet WCAG 2.1 Level AA contrast requirements:

- Text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- Interactive components: minimum 3:1 contrast ratio

Both light and dark themes maintain these standards.

### High Contrast Mode

The application responds to system-level high contrast preferences with enhanced border visibility and contrast.

### Theme Options

- **Light theme**: Default, optimized for bright environments
- **Dark theme**: Reduced eye strain in low-light conditions
- Automatic switching based on system preference
- Manual toggle button with clear visual state

### Focus Indicators

All focusable elements display a clear focus ring:

- 2px solid outline in primary color
- 2px offset from element for visibility
- Visible in both light and dark themes
- Only appears for keyboard navigation (`:focus-visible`)

## Motion and Animation

### Reduced Motion

Users who have enabled "Reduce motion" in their system preferences will see:

- Minimal or no animations
- Instant transitions instead of smooth animations
- No auto-playing animations

## Best Practices for Users

### Screen Reader Users

1. **Reading mode**: Navigate the page structure with heading navigation
2. **EXIF modal**: Tab through metadata fields; description read automatically
3. **Canvas interaction**: Canvas state changes are announced via live regions
4. **Keyboard shortcuts**: Press `?` or `F1` to hear available shortcuts

### Keyboard-Only Users

1. **Tab navigation**: Use `Tab` to move between controls
2. **Modal focus**: When a dialog opens, focus moves to the first element automatically
3. **Escape to close**: Press `Esc` to close any open dialog
4. **Skip navigation**: Use skip link to jump directly to main content

### Low Vision Users

1. **Zoom**: Use browser zoom (Ctrl/Cmd+Plus/Minus) - layout adapts to 200% zoom
2. **Theme**: Toggle dark mode with the moon/sun icon button
3. **High contrast**: Enable system high contrast mode for enhanced visibility
4. **Cursor size**: Brush cursor scales to show actual brush size

## Testing

This application has been tested with:

- ✅ Keyboard-only navigation (no mouse)
- ✅ Windows Narrator (basic functionality)
- ✅ Browser zoom up to 200%
- ✅ Light and dark themes
- ✅ Reduced motion preferences
- ✅ High contrast mode

### Recommended Screen Readers

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

## Known Limitations

1. **Canvas drawing**: The actual drawing on canvas (mouse/touch interaction) cannot be done via keyboard alone. This is a fundamental limitation of the Canvas API. Alternative: Describe areas to cover, and someone with mouse/touch can apply.

2. **Mobile screen readers**: Touch gestures for drawing may conflict with screen reader gestures. Recommend using TalkBack/VoiceOver's "explore by touch" carefully.

3. **Color picker**: jscolor library has limited keyboard support. Navigate with Tab, use arrow keys to adjust color, or type hex values directly.

## Reporting Accessibility Issues

If you encounter accessibility barriers, please [open an issue on GitHub](https://github.com/zophiezlan/substance-scrubber/issues) with:

- Your assistive technology (name and version)
- Your browser (name and version)
- Description of the issue
- Steps to reproduce

We're committed to maintaining and improving accessibility for all users.

## Standards Compliance

Substance Scrubber aims to meet:

- **WCAG 2.1 Level AA** (Web Content Accessibility Guidelines)
- **Section 508** accessibility standards
- **ARIA 1.2** (Accessible Rich Internet Applications)

Last updated: December 2025
