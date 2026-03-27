import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  forwardRef,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import TextAlign from '@tiptap/extension-text-align';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

type ToolbarDivider = {
  type: 'divider';
};

type ToolbarButton = {
  icon: string;
  tooltip: string;
  action: () => void;
  active?: () => boolean;
  disabled?: () => boolean;
};

type ToolbarItem = ToolbarDivider | ToolbarButton;

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent implements AfterViewInit, ControlValueAccessor {
  @Input() label = 'Agreement Content';
  @Input() placeholder = 'Write here...';
  @Input() readOnly = false;
  @Input() minHeight = '220px';

  readonly editorHost = viewChild<ElementRef<HTMLDivElement>>('editorHost');

  private readonly destroyRef = inject(DestroyRef);

  editor: Editor | null = null;
  disabled = false;
  private value = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  toolbar: ToolbarItem[] = [
    {
      icon: 'format_bold',
      tooltip: 'Bold',
      action: () => this.toggleBold(),
      active: () => this.isActive('bold'),
    },
    {
      icon: 'format_italic',
      tooltip: 'Italic',
      action: () => this.toggleItalic(),
      active: () => this.isActive('italic'),
    },
    {
      icon: 'format_underlined',
      tooltip: 'Underline',
      action: () => this.toggleUnderline(),
      active: () => this.isActive('underline'),
    },

    { type: 'divider' },

    {
      icon: 'notes',
      tooltip: 'Paragraph',
      action: () => this.setParagraph(),
      active: () => this.isActive('paragraph'),
    },
    {
      icon: 'title',
      tooltip: 'Heading 2',
      action: () => this.toggleHeading(2),
      active: () => this.isActive('heading', { level: 2 }),
    },
    {
      icon: 'text_fields',
      tooltip: 'Heading 3',
      action: () => this.toggleHeading(3),
      active: () => this.isActive('heading', { level: 3 }),
    },

    { type: 'divider' },

    {
      icon: 'format_list_bulleted',
      tooltip: 'Bullet list',
      action: () => this.toggleBulletList(),
      active: () => this.isActive('bulletList'),
    },
    {
      icon: 'format_list_numbered',
      tooltip: 'Ordered list',
      action: () => this.toggleOrderedList(),
      active: () => this.isActive('orderedList'),
    },

    { type: 'divider' },

    {
      icon: 'link',
      tooltip: 'Link',
      action: () => this.setLink(),
      active: () => this.isActive('link'),
    },
    {
      icon: 'link_off',
      tooltip: 'Remove link',
      action: () => this.unsetLink(),
    },

    { type: 'divider' },

    {
      icon: 'undo',
      tooltip: 'Undo',
      action: () => this.undo(),
      disabled: () => !this.canUndo(),
    },
    {
      icon: 'redo',
      tooltip: 'Redo',
      action: () => this.redo(),
      disabled: () => !this.canRedo(),
    },
    {
      icon: 'format_align_left',
      tooltip: 'Align left',
      action: () => this.setTextAlign('left'),
      active: () => this.isActive({ textAlign: 'left' }),
    },
    {
      icon: 'format_align_center',
      tooltip: 'Align center',
      action: () => this.setTextAlign('center'),
      active: () => this.isActive({ textAlign: 'center' }),
    },
    {
      icon: 'format_align_right',
      tooltip: 'Align right',
      action: () => this.setTextAlign('right'),
      active: () => this.isActive({ textAlign: 'right' }),
    },
  ];

  ngAfterViewInit(): void {
    const host = this.editorHost()?.nativeElement;
    if (!host) return;

    this.editor = new Editor({
      element: host,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          protocols: ['http', 'https', 'mailto'],
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        }),
        Placeholder.configure({
          placeholder: this.placeholder,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      content: this.value || '',
      editable: !this.readOnly && !this.disabled,
      editorProps: {
        attributes: {
          class: 'tiptap-editor__content',
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.value = html;
        this.onChange(html);
      },
      onBlur: () => {
        this.onTouched();
      },
    });

    if (this.value) {
      this.editor.commands.setContent(this.value, { emitUpdate: false });
    }

    this.destroyRef.onDestroy(() => {
      this.editor?.destroy();
      this.editor = null;
    });
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';

    if (this.editor) {
      this.editor.commands.setContent(this.value, { emitUpdate: false });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.syncEditableState();
  }

  private syncEditableState(): void {
    if (!this.editor) return;
    this.editor.setEditable(!this.readOnly && !this.disabled);
  }

  focus(): void {
    this.editor?.chain().focus().run();
  }

  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  setParagraph(): void {
    this.editor?.chain().focus().setParagraph().run();
  }

  toggleHeading(level: 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  setLink(): void {
    if (!this.editor) return;

    const previousUrl = this.editor.getAttributes('link')['href'] ?? '';
    const url = window.prompt('Link URL', previousUrl);

    if (url === null) return;

    const trimmed = url.trim();

    if (!trimmed) {
      this.editor.chain().focus().unsetLink().run();
      return;
    }

    this.editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
  }

  unsetLink(): void {
    this.editor?.chain().focus().unsetLink().run();
  }

  setTextAlign(alignment: 'left' | 'center' | 'right'): void {
    this.editor?.chain().focus().setTextAlign(alignment).run();
  }

  unsetTextAlign(): void {
    this.editor?.chain().focus().unsetTextAlign().run();
  }

  undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  isActive(
    nameOrAttrs: string | Record<string, unknown>,
    attrs?: Record<string, unknown>,
  ): boolean {
    if (!this.editor) return false;

    if (typeof nameOrAttrs === 'string') {
      return this.editor.isActive(nameOrAttrs, attrs);
    }

    return this.editor.isActive(nameOrAttrs);
  }

  canUndo(): boolean {
    return this.editor?.can().chain().focus().undo().run() ?? false;
  }

  canRedo(): boolean {
    return this.editor?.can().chain().focus().redo().run() ?? false;
  }

  isDivider(item: ToolbarItem): item is ToolbarDivider {
    return 'type' in item && item.type === 'divider';
  }
}
