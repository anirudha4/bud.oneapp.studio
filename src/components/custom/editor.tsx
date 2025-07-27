'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useDebouncedCallback } from 'use-debounce'
import { generateHTML, generateJSON } from '@tiptap/html'
import { useEffect, useMemo, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { List, ListOrderedIcon, Quote } from 'lucide-react'

const Toolbar = ({ editor }: { editor: Editor | null }) => {
	if (!editor) {
		return null
	}

	return (
		<div className="flex flex-wrap items-center gap-1 border-b rounded-t-lg bg-muted/30 px-3 py-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleBold().run()}
						disabled={!editor.can().chain().focus().toggleBold().run()}
						className={
							editor.isActive('bold')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className="font-bold">B</span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Bold (Ctrl+B)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						disabled={!editor.can().chain().focus().toggleItalic().run()}
						className={
							editor.isActive('italic')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className="italic">I</span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Italic (Ctrl+I)</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleStrike().run()}
						disabled={!editor.can().chain().focus().toggleStrike().run()}
						className={
							editor.isActive('strike')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className="line-through">S</span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Strikethrough</TooltipContent>
			</Tooltip>

			<div className="h-4 w-px bg-border mx-1" />

			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().setParagraph().run()}
						className={
							editor.isActive('paragraph')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						P
					</button>
				</TooltipTrigger>
				<TooltipContent>Paragraph</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						className={
							editor.isActive('heading', { level: 1 })
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						H1
					</button>
				</TooltipTrigger>
				<TooltipContent>Heading 1</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						className={
							editor.isActive('heading', { level: 2 })
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						H2
					</button>
				</TooltipTrigger>
				<TooltipContent>Heading 2</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						className={
							editor.isActive('heading', { level: 3 })
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						H3
					</button>
				</TooltipTrigger>
				<TooltipContent>Heading 3</TooltipContent>
			</Tooltip>

			<div className="h-4 w-px bg-border mx-1" />

			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={
							editor.isActive('bulletList')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className="font-mono"><List size={16} /></span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Bullet List</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={
							editor.isActive('orderedList')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className='font-mono'><ListOrderedIcon size={16} /></span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Numbered List</TooltipContent>
			</Tooltip>

			<div className="h-4 w-px bg-border mx-1" />

			{/* <Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleCodeBlock().run()}
						className={
							editor.isActive('codeBlock')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className="font-mono text-xs"><Code size={16} /></span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Code Block</TooltipContent>
			</Tooltip> */}
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						className={
							editor.isActive('blockquote')
								? 'rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground shadow-sm'
								: 'rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
						}
					>
						<span className="font-mono"><Quote size={16} /></span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Quote</TooltipContent>
			</Tooltip>

			<div className="h-4 w-px bg-border mx-1" />

			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => editor.chain().focus().setHorizontalRule().run()}
						className="rounded-md bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					>
						<span className="font-mono">—</span>
					</button>
				</TooltipTrigger>
				<TooltipContent>Horizontal Rule</TooltipContent>
			</Tooltip>
		</div>
	)
}

interface TiptapProps {
	html: string
	onChange: (html: string) => void
}

const Tiptap = ({ html, onChange }: TiptapProps) => {
	const [, forceUpdate] = useState({})
	const debouncedOnChange = useDebouncedCallback(onChange, 300)

	const jsonContent = useMemo(() => {
		try {
			if (html) {
				return generateJSON(html, [StarterKit])
			}
		} catch (error) {
			console.error('Error parsing HTML:', error)
		}
		return undefined
	}, [html])

	const editor = useEditor({
		extensions: [StarterKit],
		content: jsonContent,
		// Don't render immediately on the server to avoid SSR issues
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			const newHtml = generateHTML(editor.getJSON(), [StarterKit])
			debouncedOnChange(newHtml)
		},
		onSelectionUpdate: () => {
			// Force re-render of toolbar when selection changes
			forceUpdate({})
		},
		onTransaction: () => {
			// Force re-render when any transaction occurs
			forceUpdate({})
		},
	})

	useEffect(() => {
		if (editor && html !== generateHTML(editor.getJSON(), [StarterKit])) {
			const newJson = generateJSON(html, [StarterKit])
			editor.commands.setContent(newJson, { emitUpdate: false }) // false to avoid triggering onUpdate
		}
	}, [html, editor])

	return (
		<div className="relative overflow-hidden border rounded-lg bg-background shadow-sm">
			<Toolbar editor={editor} />
			<div className="min-h-[200px]">
				<EditorContent
					editor={editor}
					className="prose text-sm prose-sm max-w-none p-4 focus-within:outline-none
						[&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none
						[&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:text-foreground [&_.ProseMirror_p]:leading-relaxed
						[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:text-foreground
						[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-foreground
						[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-medium [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-foreground
						[&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:list-disc
						[&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:list-decimal
						[&_.ProseMirror_li]:my-1 [&_.ProseMirror_li]:text-foreground [&_.ProseMirror_li]:leading-relaxed
						[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground
						[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto
						[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono
						[&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-6
						[&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.ProseMirror_s]:line-through"
				/>
			</div>
		</div>
	)
}

export default Tiptap