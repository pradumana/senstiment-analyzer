# Testing Guide

## Quick Test Checklist

### 1. Basic Chat ✅
- Open the app
- Type "I love this!" and send
- Should show POSITIVE sentiment with 👍👎 buttons

### 2. Emoji Detection ✅
- Type "This is great 😊🎉" and send
- Should detect emojis and boost positive sentiment

### 3. Intent Recognition ✅
- Type "How does this work?" → Should detect as 'question'
- Type "This is broken!" → Should detect as 'complaint'
- Type "Thank you!" → Should detect as 'praise'

### 4. Emotion Detection ✅
- Type "I'm so excited!" → Should show 'excited' emotion
- Type "I'm frustrated" → Should show 'frustrated' emotion

### 5. User Feedback ✅
- Click 👍 on a message → Should show "Thanks!"
- Click 👎 on a message → Should ask for correct sentiment
- Model should learn from correction

### 6. Context Awareness ✅
- Send multiple messages
- Bot responses should reference previous context
- Try: "I have a problem" → "It's still not working" (should understand continuation)

### 7. Suggested Replies ✅
- After bot responds, suggested reply buttons should appear
- Click a suggestion → Should fill input field

### 8. Message Reactions ✅
- Click emoji reactions (👍❤️😊🎉🤔) on bot messages
- Should toggle active state

### 9. History Sidebar ✅
- Click ☰ menu (mobile) or see sidebar (desktop)
- Should show all past messages with sentiment colors
- Green border = positive, Red = negative, Gray = neutral

### 10. Export Chat ✅
- Click "📥 Export" in sidebar
- Choose JSON or TXT
- File should download with conversation history

### 11. Dark Mode ✅
- Click 🌙 button or press Ctrl+D
- Theme should switch to dark
- Preference should persist on reload

### 12. Voice Input ✅
- Click 🎤 button
- Speak into microphone
- Text should appear in input field
- Note: Requires browser support (Chrome/Edge)

### 13. Analytics Dashboard ✅
- Click 📊 button
- Should show:
  - Total conversations
  - Words learned
  - User corrections
  - Accuracy percentage
  - Sentiment distribution charts
  - Top positive/negative words

### 14. Keyboard Shortcuts ✅
- Press Ctrl+K → Should focus input
- Press Ctrl+D → Should toggle dark mode
- Press Ctrl+H → Should toggle sidebar
- Press Ctrl+E → Should open export dialog
- Press Ctrl+Shift+C → Should toggle high contrast

### 15. Error Recovery ✅
- Disconnect internet
- Send a message
- Should show error with 🔄 Retry button

### 16. Accessibility ✅
- Use Tab key to navigate
- All interactive elements should be focusable
- Screen reader should announce messages
- High contrast mode (Ctrl+Shift+C) should work

## Expected Behavior

### First Message
- Welcome message displayed
- No history in sidebar
- Training status shows "Learning from conversations..."

### After 5+ Messages
- History sidebar populated
- Analytics show data
- Model accuracy visible
- Suggested replies appear
- Context-aware responses

### After User Feedback
- Training status updates with learned words count
- Analytics accuracy improves
- Model gives better predictions

## Common Issues

### Voice Input Not Working
- Check browser compatibility (Chrome/Edge recommended)
- Grant microphone permissions
- Button will be hidden if not supported

### Analytics Empty
- Need at least 1 conversation
- Refresh page if data doesn't load

### Dark Mode Not Persisting
- Check browser localStorage is enabled
- Clear cache and try again

## Performance Expectations

- Message send: < 2 seconds
- Analytics load: < 1 second
- Voice recognition: 1-3 seconds
- Export: Instant
- Theme toggle: Instant

## Browser Compatibility

✅ Chrome/Edge (all features)
✅ Firefox (all except voice)
✅ Safari (all except voice)
⚠️ IE11 (not supported)

## Mobile Testing

- Sidebar should slide in from left
- ☰ menu button visible
- Touch-friendly buttons
- Responsive layout
- Voice input works on mobile Chrome
