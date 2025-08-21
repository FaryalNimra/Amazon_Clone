# Modal Scroll Prevention System

This system prevents background page scrolling when modals/popups are open, providing a better user experience.

## How It Works

### 1. **Custom Hook: `useBodyScroll`**
- Located in `hooks/useBodyScroll.ts`
- Automatically disables body scrolling when a modal is open
- Restores scroll position when modal closes
- Adds/removes `modal-open` CSS class for styling

### 2. **ModalContext Integration**
- Automatically tracks when any modal is open
- Uses `useBodyScroll` hook to manage body scrolling
- Provides `isAnyModalOpen` boolean for components to check
- Includes `closeAllModals()` utility function

### 3. **CSS Classes**
- `.modal-open` - Applied to body when any modal is open
- `.modal-container` - For modal positioning
- `.modal-backdrop` - For modal backdrop styling
- `.modal-scrollable` - For scrollable modal content

## Usage

### For Components Using ModalContext
```tsx
import { useModal } from '@/contexts/ModalContext'

const MyComponent = () => {
  const { isAnyModalOpen, openSignInModal } = useModal()
  
  // Body scrolling is automatically managed
  return (
    <button onClick={openSignInModal}>
      Open Modal
    </button>
  )
}
```

### For Custom Modals (like Seller Dashboard)
```tsx
import { useBodyScroll } from '@/hooks/useBodyScroll'

const MyModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Prevent background scrolling when modal is open
  useBodyScroll(isOpen)
  
  return (
    isOpen && (
      <div className="modal-container">
        {/* Modal content */}
      </div>
    )
  )
}
```

## Features

✅ **Automatic Scroll Prevention** - No manual management needed
✅ **Scroll Position Restoration** - Returns to exact scroll position
✅ **Mobile Optimized** - Works on iOS Safari and Android
✅ **Touch Scrolling** - Prevents touch scrolling on background
✅ **CSS Integration** - Uses CSS classes for styling control
✅ **Multiple Modals** - Handles multiple open modals correctly

## CSS Classes Available

```css
/* Applied to body when modal is open */
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}

/* For modal containers */
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
}

/* For scrollable modal content */
.modal-scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (Desktop & Mobile)
- ✅ iOS Safari
- ✅ Android Chrome

## Troubleshooting

### Modal not preventing scroll?
1. Ensure `useBodyScroll` hook is imported and used
2. Check that modal state is properly managed
3. Verify CSS classes are applied

### Scroll position not restored?
1. Check for JavaScript errors in console
2. Ensure modal close function is called properly
3. Verify cleanup function in `useBodyScroll` hook

### Mobile issues?
1. Check iOS Safari specific CSS rules
2. Verify touch-action CSS properties
3. Test on actual mobile devices


