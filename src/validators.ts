export async function titleValidator(form: Record<string, any>) {
    let title = form['title'];
    if (!title) {
        throw new Error("title required");
    }
    return title
}

export async function toggleValidator(form: Record<string, any>) {
    let todoId = form["id"];
    let doneText = form["done"];
    if (!todoId || !doneText) {
        throw new Error("'todo id' and 'done' attributes required");
    }
    let done: number;
    if (doneText == "false") {
        done = 0;
    } else {
        done = 1;
    }
    return { todoId, done };
}