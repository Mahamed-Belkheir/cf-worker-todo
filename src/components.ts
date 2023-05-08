import htm from "htm";
import vhtml from "vhtml";
import { TodoItem } from "./index";

const html = htm.bind(vhtml);

function body(children: string | string[]) {
    return html`
    <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Document</title>
        </head>
        <body>
            ${children}
        </body>
    </html>
    `
}

export function renderTodos(todos: TodoItem[]) {
    let done = todos.filter(t => t.done);
    let notDone = todos.filter(t => !t.done);
    return body(html`

    <script>
        function toggleTodo(event) {
            console.log(\`started\`)
            let fd = new FormData();
            fd.append(\`id\`, event.target.id);
            fd.append(\`done\`, event.target.checked);
            fetch(\`/toggle\`, {
                method: \`PATCH\`,
                body: fd
            })
            .then(function(response) {
                window.location = \`/\`
            })
            .catch(console.error)
        } 

    </script>

    <h1>Todo Items to do</h1>
    <h2> Left to do </h2>
        ${ notDone.map(t => html`<div >${t.title} <input id=${t.id} type="checkbox" onclick="toggleTodo(event)"/> </div>`) }
    <h2> Done </h2>
        ${ done.map(t => html`<div > ${t.title} <input id=${t.id} type="checkbox" onclick="toggleTodo(event)" checked/> </div>`) }

    <h3> Add todo </h3>
        <form method="POST" action="/add">
            <label>Todo:
                <input id="title" name="title"/>
            </label>
            <button>Add</button>  
        </form> 
    `)
}

export function renderError(error: string) {
    return body(html`
        <h1> Error </h1>
        <p>${error}</p>
    `)
}