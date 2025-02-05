import Asciidoctor from 'asciidoctor';


const convertHtmlTableToAsciiDoc = (tableHtml) => {
    const rows = [...tableHtml.matchAll(/<tr>(.*?)<\/tr>/gs)].map(match => match[1]);

    let asciidocTable = "\n|===\n";

    rows.forEach((row, rowIndex) => {
        const cells = [...row.matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map(cell => cell[1].trim());

        if (cells.length > 0) {
            asciidocTable += `| ${cells.join(' | ')}\n`;
        }
    });

    asciidocTable += "|===\n";
    return asciidocTable;
};

const convertHtmlToAsciiDoc = (html) => {
    let asciidoc = html;

    // Replace basic tags with AsciiDoc syntax
    asciidoc = asciidoc.replace(
        /<div\s+class="paragraph\s+text-center">\s*<p>(.*?)<\/p>\s*<\/div>/gi,
        '[.text-center]\n$1'
    );
    asciidoc = asciidoc.replace(
        /<div\s+class="paragraph\s+text-right">\s*<p>(.*?)<\/p>\s*<\/div>/gi,
        '[.text-right]\n$1'
    );
    asciidoc = asciidoc.replace(
        /<div\s+class="paragraph\s+text-left">\s*<p>(.*?)<\/p>\s*<\/div>/gi,
        '[.text-left]\n$1'
    );
    asciidoc = asciidoc.replace(
        /<div class="admonitionblock (note|tip|warning)">[\s\S]*?<div class="title">\s*(.*?)\s*<\/div>[\s\S]*?<td class="content">\s*(.*?)\s*<\/td>[\s\S]*?<\/div>/gis,
        (_, type, title, content) => `${type.toUpperCase()}: ${content.trim()} \n`
    );
    asciidoc = asciidoc.replace(/\s*id="[^"]*"/g, '');
    //asciidoc = asciidoc.replace(/<br\s*\/?>\s*/g, ' +\n');
    asciidoc = asciidoc.replace(/<\/?p>/g, '');
    asciidoc = asciidoc.replace(/<\/p>\s*<p>/g, '');
    asciidoc = asciidoc.replace(/<strong>(.*?)<\/strong>/g, '**$1**'); // Bold
    asciidoc = asciidoc.replace(/<em>(.*?)<\/em>/g, '_$1_'); // Italic
    asciidoc = asciidoc.replace(/<code>(.*?)<\/code>/g, '`$1`'); // Monospace
    asciidoc = asciidoc.replace(/<sub>(.*?)<\/sub>/g, '~$1~'); // Subscript
    asciidoc = asciidoc.replace(/<sup>(.*?)<\/sup>/g, '^$1^'); // Superscript
    asciidoc = asciidoc.replace(/<mark>(.*?)<\/mark>/g, '#$1#'); // Superscript
    asciidoc = asciidoc.replace(/<h1>(.*?)<\/h1>/g, '= $1'); // Headers
    asciidoc = asciidoc.replace(/<h2>(.*?)<\/h2>/g, '== $1');
    asciidoc = asciidoc.replace(/<h3>(.*?)<\/h3>/g, '=== $1');
    asciidoc = asciidoc.replace(/<h4>(.*?)<\/h4>/g, '==== $1'); // Headers
    asciidoc = asciidoc.replace(/<h5>(.*?)<\/h5>/g, '===== $1');
    asciidoc = asciidoc.replace(/<h6>(.*?)<\/h6>/g, '====== $1');
    asciidoc = asciidoc.replace(/<\/?hr>/g, "'''");
    asciidoc = asciidoc.replace(/<ul>/g, '').replace(/<\/ul>/g, ''); // Remove <ul>
    asciidoc = asciidoc.replace(/<li>(.*?)<\/li>/g, '* $1'); // Unordered list
    asciidoc = asciidoc.replace(/<a href="(.*?)">(.*?)<\/a>/g, 'link:$1[$2]'); // Links
    asciidoc = asciidoc.replace(/<br\s*\/?>/g, '\n');
    asciidoc = asciidoc.replace(/<table[^>]*>.*?<\/table>/gs, (tableHtml) => {
        return convertHtmlTableToAsciiDoc(tableHtml);
    });
    asciidoc = asciidoc.replace(
        /<img\s+src="blob:(.*?)"\s+alt="(.*?)"\s*\/?>/gi,
        'image::blob:$1[$2]\n'
    );
    asciidoc = asciidoc.replace(
        /<span\s+class="underline">(.*?)<\/span>/gi,
        '[underline]#$1#'
    );
    asciidoc = asciidoc.replace(
        /<span\s+class="line-through">(.*?)<\/span>/gi,
        '[line-through]#$1#'
    );
    asciidoc = asciidoc.replace(/\s*class="[^"]*"/g, '');
    asciidoc = asciidoc.replace(/<div>/g, '').replace(/<\/div>/g, '');
    console.log("Print clean doc", asciidoc)
    return asciidoc.trim();
};

const convertAsciiDocToEditorValue = (asciidocText) => {
    const lines = asciidocText.split('\n');
    return lines.map(line => {
        if (line.startsWith('image::data:')) {
            return {
                type: 'collapsible-image',
                base64: line.trim(),
                collapsed: true,
                children: [{ text: '' }]
            };
        } else {
            return {
                type: 'paragraph',
                children: [{ text: line }]
            };
        }
    });
};

// Initialize Asciidoctor
const asciidoctor = Asciidoctor();


// Initial editor value
const initialValue = [
    {
        type: 'paragraph',
        children: [{ text: 'Welcome to your AsciiDoc rich text editor!' }],
    },
];