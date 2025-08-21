# Autosave Implementation for Text Editor

## Overview
The TextEditor component now includes robust autosave functionality with hydration, debounced saving, and offline support to prevent data loss.

## Features

### 🔄 Hydration
- **Server-first loading**: Attempts to load the most recent page from the server
- **Draft fallback**: Uses localStorage draft if server data is unavailable or older
- **Smart merging**: Compares timestamps to use the most recent data source

### ⚡ Debounced Autosave
- **1.2 second debounce**: Prevents excessive API calls during rapid typing
- **Race condition protection**: Uses `inFlight` flag to prevent overlapping saves
- **Dirty tracking**: Only saves when content has actually changed

### 💾 Local Draft Safety Net
- **Immediate localStorage backup**: Saves to localStorage on every change
- **24-hour expiration**: Automatically cleans up old drafts
- **Cross-session persistence**: Survives page refreshes and browser restarts

### 🌐 Offline Support
- **Network detection**: Monitors online/offline status
- **Offline queuing**: Queues saves when offline, executes when back online
- **Visual feedback**: Shows offline status with appropriate UI indicators

### 🛡️ Data Loss Prevention
- **Beforeunload warning**: Warns users about unsaved changes
- **Automatic draft saving**: Saves draft before page unload
- **Error recovery**: Falls back to local data if server is unavailable

## Implementation Details

### State Management
```typescript
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Key state variables
const [status, setStatus] = useState<SaveStatus>('idle');
const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [hasDraft, setHasDraft] = useState(false);
```

### Refs for Performance
```typescript
const latest = useRef<{ content: string; editorState: any } | null>(null);
const timer = useRef<number | null>(null);
const dirty = useRef(false);
const inFlight = useRef(false);
const pendingSave = useRef(false);
```

### Key Functions

#### Hydration
```typescript
const hydrateEditor = async () => {
  // 1. Check for local draft
  // 2. Try to get server data
  // 3. Compare timestamps
  // 4. Use most recent data
  // 5. Fallback to draft if server fails
};
```

#### Debounced Autosave
```typescript
const scheduleSave = useCallback(() => {
  if (timer.current) clearTimeout(timer.current);
  if (!isOnline) {
    pendingSave.current = true;
    return;
  }
  timer.current = window.setTimeout(performSave, 1200);
}, [isOnline]);
```

#### Draft Management
```typescript
const saveDraft = useCallback((data) => {
  const draft = {
    content: data.content,
    editorState: data.editorState,
    timestamp: Date.now(),
    pageId: pageId || undefined,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}, [pageId]);
```

## UI Feedback

### Status Indicators
- **Saving**: Spinning loader + "Saving..." text
- **Saved**: Green checkmark + timestamp
- **Error**: Red alert icon + retry button
- **Offline**: Orange wifi-off icon + "Offline - saving locally"
- **Idle**: Clock icon + last saved time

### Visual Elements
- **Save button**: Disabled when saving or offline
- **Draft badge**: Shows when local backup is available
- **Error banner**: Displays server errors with context

## API Integration

### Endpoints Used
- `GET /api/v1/pages/all` - Load most recent page
- `POST /api/v1/pages/create` - Create new page
- `PUT /api/v1/pages/:pageId` - Update existing page

### Data Flow
1. **Editor change** → `handleEditorChange`
2. **Immediate draft save** → `saveDraft`
3. **Schedule server save** → `scheduleSave` (debounced)
4. **Execute save** → `performSave`
5. **Update UI** → Status indicators

## Error Handling

### Network Errors
- Retry on next change
- Fallback to local storage
- Visual error indicators

### Storage Errors
- Graceful degradation
- Console warnings
- No blocking of editor functionality

### Race Conditions
- `inFlight` flag prevents overlapping saves
- Cleanup on unmount
- Proper timeout management

## Performance Considerations

### Debouncing
- 1.2 second delay prevents excessive API calls
- Coalesces rapid edits into single saves

### Memory Management
- Proper cleanup of timeouts and event listeners
- Ref-based state to avoid unnecessary re-renders

### Storage Limits
- 24-hour draft expiration
- Automatic cleanup of old drafts

## Future Enhancements

### Potential Improvements
- **Conflict resolution**: Handle concurrent edits
- **Version history**: Track document versions
- **Real-time collaboration**: WebSocket-based sync
- **Compression**: Compress large editor states
- **Background sync**: Service worker for offline-first

### Monitoring
- **Save success rate**: Track autosave reliability
- **Draft usage**: Monitor how often drafts are used
- **Error tracking**: Log and analyze save failures

## Testing

### Manual Testing Scenarios
1. **Normal editing**: Type and verify autosave
2. **Network interruption**: Disconnect and reconnect
3. **Page refresh**: Verify draft recovery
4. **Browser close**: Test beforeunload warning
5. **Offline editing**: Edit while offline, sync when online

### Edge Cases
- **Large documents**: Test with extensive content
- **Rapid typing**: Verify debouncing works
- **Multiple tabs**: Test concurrent editing
- **Storage full**: Handle localStorage limits
