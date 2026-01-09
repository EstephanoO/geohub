# MapLibre Popup Visibility Issues - Debugging Steps and Fixes

## Issues Identified

1. **Missing MapLibre CSS import**: The `MapContainer.tsx` component was missing the essential `maplibre-gl/dist/maplibre-gl.css` import.

2. **Insufficient z-index**: The popup styles had low z-index values that could be overridden by other UI elements.

3. **Lack of popup positioning configuration**: The popup was created without proper offset and anchor settings.

4. **Missing visual debugging**: No console logs to verify popup element creation and positioning.

## Fixes Applied

### 1. Added MapLibre CSS Import
```typescript
// in MapContainer.tsx
import "maplibre-gl/dist/maplibre-gl.css";
```

### 2. Enhanced Popup Configuration
```typescript
// in useMap.ts - popup creation
popupRef.current = new maplibregl.Popup({
  closeButton: false,
  closeOnClick: false,
  className: "map-popup",
  offset: [0, -10],  // Added offset for better positioning
  anchor: 'bottom'    // Added anchor for consistent positioning
});
```

### 3. Improved CSS Styles
```css
/* Enhanced popup visibility */
.map-popup {
  z-index: 999999 !important;
  background: white !important;
  color: black !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
  font-size: 12px !important;
  padding: 8px !important;
  max-width: 200px !important;
}

.maplibregl-popup {
  z-index: 999999 !important;
  position: absolute !important;
}

.maplibregl-popup-content {
  z-index: 999999 !important;
  position: relative !important;
  background: white !important;
  color: black !important;
  padding: 8px !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
  font-size: 12px !important;
}
```

### 4. Enhanced Debugging
```typescript
// Added comprehensive popup debugging
if (popupRef.current) {
  popupRef.current.setLngLat(coordinates).setHTML(popupContent).addTo(map);
  console.log("✅ Popup added to map");
  console.log("🔍 Popup element:", popupRef.current.getElement());
  console.log("🔍 Popup coordinates:", coordinates);
  
  // Debug: Check if popup element exists and is visible
  setTimeout(() => {
    const popupElement = popupRef.current?.getElement();
    if (popupElement) {
      const popupStyles = getComputedStyle(popupElement);
      console.log("🔍 Popup element styles:", {
        display: popupStyles.display,
        visibility: popupStyles.visibility,
        zIndex: popupStyles.zIndex,
        opacity: popupStyles.opacity,
        position: popupStyles.position,
        left: popupStyles.left,
        top: popupStyles.top,
        transform: popupStyles.transform,
        width: popupStyles.width,
        height: popupStyles.height,
        offsetWidth: popupElement.offsetWidth,
        offsetHeight: popupElement.offsetHeight
      });
      
      // Check if popup is actually visible on screen
      const rect = popupElement.getBoundingClientRect();
      console.log("🔍 Popup bounding rect:", {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        isVisible: rect.width > 0 && rect.height > 0
      });
    }
  }, 100);
}
```

## Common MapLibre Popup Issues and Solutions

### 1. Missing CSS Import
**Problem**: Popup elements don't have proper styling
**Solution**: Always import `maplibre-gl/dist/maplibre-gl.css`

### 2. Z-index Conflicts
**Problem**: Popup appears behind other elements
**Solution**: Use high z-index values (999999) with !important

### 3. Positioning Issues
**Problem**: Popup appears off-screen or misaligned
**Solution**: 
- Use proper `offset` and `anchor` options
- Check coordinate validity
- Verify map container dimensions

### 4. Dark Mode Visibility
**Problem**: Popup text not visible in dark mode
**Solution**: Add dark mode styles with contrasting colors

### 5. Container Issues
**Problem**: Popup container has incorrect dimensions or overflow
**Solution**: Ensure parent container has proper CSS (overflow: visible, position: relative)

## Debugging Checklist

1. **Console Logs**: Check for "Popup added to map" and element creation logs
2. **Element Inspector**: Verify popup element exists in DOM
3. **Computed Styles**: Check display, visibility, opacity, z-index
4. **Bounding Rectangle**: Verify popup has positive width/height
5. **Parent Elements**: Check for CSS overflow or positioning issues
6. **CSS Conflicts**: Look for conflicting styles in parent containers
7. **Map State**: Ensure map is properly initialized and loaded

## Testing Steps

1. Open browser developer tools
2. Hover over map features to trigger popup
3. Check console logs for popup creation messages
4. Inspect popup element in DOM tree
5. Verify computed styles and bounding rectangle
6. Test in both light and dark modes
7. Check responsive behavior

## Files Modified

- `/app/(admin)/admin/map/new/components/MapContainer.tsx`
- `/app/(admin)/admin/map/new/hooks/useMap.ts`  
- `/app/globals.css`

The popup should now be visible with proper styling, high z-index, and comprehensive debugging output.