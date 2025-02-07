import React, { useState, useEffect } from 'react';
import { createEditor, Transforms, Range, Editor, Path } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import Toolbar from './Toolbar';
import {  
    convertHtmlToAsciiDoc, 
    convertAsciiDocToEditorValue, 
    asciidoctor, 
    initialValue 
  } from './asciidocUtils';
  import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";import Pages from "./Pages"; // Your dynamic AsciiDoc page renderer

const RichTextEditor = () => {
    const [value, setValue] = useState(initialValue);
    const [asciidocText, setAsciidocText] = useState('');
    const [asciidocPreview, setAsciidocPreview] = useState('');
    const navigate = useNavigate();
    
    const [editor] = useState(() => {
        const e = withReact(createEditor());
    
        // Ensure Slate treats 'image' as a void element
        const { isVoid } = e;
        e.isVoid = (element) => element.type === 'image' ? true : isVoid(element);
    
        return e;
    });
    

    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        const asciidocText = value
            .map(node => {
                return node.children.map(child => child.text).join('');
            })
            .join('\n');
        setAsciidocText(asciidocText);

        const htmlPreview = asciidoctor.convert(asciidocText, { attributes: { showtitle: true } });
        setAsciidocPreview(htmlPreview);
    }, [value]);


    const handleAsciiDocToEditor = () => {
        const newEditorValue = convertAsciiDocToEditorValue(asciidocText);
        setIsConverting(true);  // Prevent the infinite loop
        setValue(newEditorValue);
        console.log("new value", newEditorValue)
    };
    

    const handleViewChange = (newView) => {
        if (newView === 'raw') {
            // Convert from editor value to raw AsciiDoc
            const asciidocFromEditor = value
                .map(node => node.children.map(child => child.text).join(''))
                .join('\n');
            setAsciidocText(asciidocFromEditor);
        } 
        
        if (newView === 'preview') {
            // Convert raw AsciiDoc to editor nodes
            const editorValue = convertAsciiDocToEditorValue(asciidocText);
            setValue(editorValue);
        }
    };
    

    const handleRenderedEdit = (event) => {
        let updatedHTML = event.target.innerHTML;

        updatedHTML = updatedHTML
            .replace(/<p>\s*<\/p>/g, '<br>')
            .replace(/<\/p>s*<p>/g, '\n\n')

        const updatedAsciiDoc = convertHtmlToAsciiDoc(updatedHTML);

        if (updatedAsciiDoc !== asciidocText) {
            setAsciidocText(updatedAsciiDoc);

            Transforms.select(editor, {
                anchor: Editor.start(editor, []),
                focus: Editor.end(editor, []),
            });
            Transforms.delete(editor);
            Transforms.insertNodes(editor, [{ type: 'paragraph', children: [{ text: updatedAsciiDoc }] }]);
        }
    };


    // Handle editor changes
    const handleEditorChange = (newValue) => {
        setValue(newValue);

        // Convert Slate value to AsciiDoc syntax
        const asciidocText = newValue
        .map((node) => node.children.map((child) => child.text).join(''))
        .join('\n');
        setAsciidocPreview(asciidoctor.convert(asciidocText));
    };

    let lastMouseDownTime = null;
    
    const handleMouseDown = () => {
        lastMouseDownTime = Date.now();
    };

    const handleMouseUp = (editor) => {
        const mouseUpTime = Date.now();
        const duration = mouseUpTime - lastMouseDownTime;

        const isDoubleClick = duration < 150;
        const { selection } = editor;

        if (selection && Range.isExpanded(selection)) {
            const selectedText = Editor.string(editor, selection);

            if (isDoubleClick) {
                console.log("Double-click detected");
                const trailingWhitespace = selectedText.match(/\s+$/);
                if (trailingWhitespace) {
                    const whitespaceLength = trailingWhitespace[0].length;
                    const newFocusOffset = selection.focus.offset - whitespaceLength;
        
                    Transforms.setSelection(editor, {
                        anchor: selection.anchor,
                        focus: { path: selection.focus.path, offset: newFocusOffset },
                    });
                }
            } else {
                console.log("Click and drag detected")
            }

        }
    };    
    

    const handleListKeydown = (event, editor, isUnordered, isOrdered) => {
        const { selection } = editor;

        if (!selection || !Range.isCollapsed(selection)) return;

        const currentLine = Editor.string(editor, selection.anchor.path);

        if (event.key === 'Enter' && (isUnordered || isOrdered)) {
            event.preventDefault();

            const lines = currentLine.split('\n');
            let lastLine = lines[lines.length - 1];


            const currentSyntaxMatch = isUnordered
                ? lastLine.match(/^(\*+)\s/)
                : lastLine.match(/^(\.+)\s/);

            if (currentSyntaxMatch) {
                const currentSyntax = currentSyntaxMatch[1];
                const listSyntax = `${currentSyntax} `;

                const isEmptyListItem = lastLine.trim() === listSyntax.trim();

                    if (isEmptyListItem) {
                        lines[lines.length - 1] = '';

                        const updatedContent = lines.join('\n');
                        Transforms.select(editor, selection.anchor);
                        Transforms.delete(editor, { at: selection.anchor }); 

                        Transforms.insertText(editor, `\n\n`);
                        return;

                    } else {
                        Transforms.insertText(editor, `\n${listSyntax}`);
                        console.log("Adding Syntax on Enter:", listSyntax);
                    }
                }

            } 

        if (event.key === 'Tab') {
            event.preventDefault();
        
            const currentSyntaxMatch = isUnordered
                ? currentLine.match(/^(\*+)\s/)
                : currentLine.match(/^(\.+)\s/);
        
            if (currentSyntaxMatch) {
                const currentSyntax = currentSyntaxMatch[1];
                const { path, offset } = selection.anchor;
                const syntaxLength = currentSyntax.length + 1;
                const newOffset = offset - syntaxLength >= 0 ? offset - syntaxLength : 0;
        
                if (!event.shiftKey && (isUnordered || isOrdered)) {
                    // **Handle Tab (Increase Depth)**
                    Transforms.insertText(editor, (isUnordered ? '*' : '.'), {
                        at: { path, offset: newOffset }
                    });
        
                    console.log("Increased depth with:", currentSyntax + (isUnordered ? '*' : '.'));
        
                } else if (event.shiftKey && (isUnordered || isOrdered)) {
                    // **Handle Shift + Tab (Decrease Depth)**
        
                        // Just delete the last symbol
                    Transforms.delete(editor, {
                        at: {
                            anchor: { path, offset: newOffset + currentSyntax.length - 1 },
                            focus: { path, offset: newOffset + currentSyntax.length }
                        }
                    });
        
                    console.log("Decreased depth, new syntax:", currentSyntax.slice(0, -1));
                } else {
                    console.log("Cannot decrease depth further. Only one symbol left.");
                    }
                }
            }
        
    };
        
    return (
        <div>
            {/* Banner with Title and Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4f4f4', padding: '10px', borderBottom: '1px solid #ccc' }}>
                <button 
                style={{ padding: '8px 16px', backgroundColor: '#ff6347', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => window.location.href = 'https://github.com/ohuweih/Doh/issues'}>
                    Report a Bug
                </button>
                <h1 
                    onClick={() => navigate("/")}
                    style={{ 
                        margin: 0, 
                        fontSize: '36px', 
                        color: 'rgba(21, 29, 133, 0.5)',  /* Bright orange */
                        textShadow: '2px 2px 5px rgba(0, 0, 0, 0.5)',  /* Depth effect */
                        fontWeight: 'bold', 
                        fontFamily: 'Arial Black, Gadget, sans-serif',  /* Squared letters */
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                }}>
                    D'OH
                </h1>
                <button 
                    style={{ padding: '8px 16px', backgroundColor: '#4682b4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => navigate("/aboutus")}
                >
                    About Us
                </button>
            </div>

            <Routes>
                <Route path="/" element={
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', height: '100vh' }}>
                        
                        {/* Editor Area (Raw AsciiDoc or Rich Text Editor) */}
                        <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}>
                            <Slate editor={editor} initialValue={value} value={value} onChange={handleEditorChange}>
                                <Toolbar editor={editor} value={value} />
                                <Editable
                                    onKeyDown={(event) => {
                                        const currentLine = Editor.string(editor, editor.selection.anchor.path);
                                        console.log("Current line in onkey down function", currentLine)
                                        
                                        const lines = currentLine.split('\n');
                                        const lastLine = lines[lines.length - 1]; 
                                        console.log("Last Line:", lastLine); 

                                        const isUnordered = lastLine.match(/^(\*+)\s/);
                                        const isOrdered = lastLine.match(/^(\.+)\s/);
                                        if (isUnordered || isOrdered) {
                                            handleListKeydown(event, editor, isUnordered, isOrdered);
                                        }
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={() => handleMouseUp(editor)}
                                    onFocus={() => handleViewChange('preview')}
                                    style={{ border: '1px solid #ccc', padding: '15px', minHeight: '200px' }}
                                />
                            </Slate>
                        </div>
                
                        {/* Rendered Preview Area */}
                        <div 
                            style={{ flex: 1, border: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onFocus={() => handleViewChange('preview')}
                            onBlur={handleRenderedEdit}
                            className="preview-container"
                            dangerouslySetInnerHTML={{ __html: asciidocPreview }}
                        />
                    </div>
                } />
                <Route path="/aboutus" element={<Pages page="/aboutus.adoc" pageHeader="About Us" />} />
            </Routes>
        </div>
    );

    
};
export default RichTextEditor;