import React, { useEffect, useState } from "react";
import Asciidoctor from "asciidoctor";

const asciidoctor = Asciidoctor();

const Pages = ({page, pageHeader}) => {
    const [content, setContent] = useState("");

    useEffect(() => {
        fetch(page)
        .then( response => response.text())
        .then(adocContent => {
            const html = asciidoctor.convert(adocContent, { attributes: { showtitle: true } });
            setContent(html);
        })
        .catch( error => console.error("Error loading Page:", page, "Error:", error));
    }, []);

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default Pages