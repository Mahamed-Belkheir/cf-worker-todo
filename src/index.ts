import { renderError, renderTodos } from "./components";

const USERCOOKIENAME = "cf-user-cookie-test";
const userRegexp = /cf-user-cookie-test=(\S+?);|cf-user-cookie-test=(\S+)/g

export type TodoItem = {
	id: string,
	title: string,
	done: boolean
}

function getUser(request: Request) {
	let cookies = request.headers.get("cookie") || "";
	let result = cookies.match(userRegexp);
	if (result) {
		return result[0].split("=")[1];
	}
}

function errResponse(err: string) {
	return new Response(renderError(err) as any, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
		}
	});
}

function redirect() {
	return new Response(null, {
		headers: {
			Location: "/"
		},
		status: 303
	})
}

export interface Env {
	todo_db: D1Database;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		let path = new URL(request.url).pathname
		switch (path) {
			case "/add":
				return createTodo(request, env);
			case "/toggle":
				return toggleTodo(request, env);	
			default:
				return mainView(request, env);
		}
	},
};


async function mainView(request: Request, env: Env) {
	let id = getUser(request) || crypto.randomUUID();
	let todos: TodoItem[] = (await env.todo_db.prepare(`select id, title, done from todos where userId = ?`)
	.bind(id)
	.all<TodoItem>()).results || [];
	
	let result = renderTodos(todos as any as TodoItem[]);
	
	return new Response(result as any, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Set-Cookie': `${USERCOOKIENAME}=${id}; Path=/`
		}
	})
}

async function createTodo(request: Request, env: Env) {
	let data = await request.formData();
	let title = data.get("title");
	if (!title) {
		return errResponse("'title' attribute required");
	}
	let id = getUser(request);
	if (!id) {
		return errResponse("user not logged in");
	}
	await env.todo_db.prepare(`INSERT INTO todos (title, done, userId) VALUES (?, false, ?)`)
	.bind(title, id)
	.run();

	return redirect();
}

async function toggleTodo(request: Request, env: Env) {
	let data = await request.formData();
	let todoId = data.get("id");
	let done: number;
	let doneText = data.get("done");
	if (doneText == "false") {
		done = 0;
	} else {
		done = 1;
	}
	if (!todoId || done === undefined) {
		return errResponse("'todo id' and 'done' attributes required");
	}
	let id = getUser(request);
	if (!id) {
		return errResponse("user not logged in");
	}

	await env.todo_db.prepare(`UPDATE todos SET done = ? WHERE id = ? and userId = ?`)
	.bind(done, todoId, id)
	.run();

	return redirect();
}
