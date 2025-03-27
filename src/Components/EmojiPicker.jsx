import { EmojiPicker } from "frimousse";

export function MyEmojiPicker({ onEmojiSelect }) {
  return (
    <EmojiPicker.Root>
      <EmojiPicker.Search />
      <EmojiPicker.Viewport>
        <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
        <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
        <EmojiPicker.List
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div {...props}>{category.label}</div>
            ),
            Row: ({ children, ...props }) => <div {...props}>{children}</div>,
            Emoji: ({ emoji, ...props }) => (
              <button
                {...props}
                onClick={() => {
                  onEmojiSelect(emoji.emoji);
                }}
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

export default MyEmojiPicker;
