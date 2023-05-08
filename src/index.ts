import { HonoAdapator } from "@dikur/hono";
import { Hono } from "hono";
import { TodoController } from "./controller";
import { renderError } from "./components";

export type Env = {
	todo_db: D1Database;
}

export const USERCOOKIENAME = "cf-user-cookie-test";

export type TodoItem = {
	id: string,
	title: string,
	done: boolean
}

let app = new Hono();

HonoAdapator(TodoController, app);
app.showRoutes();

app.onError((err, ctx) => {
    return ctx.html(renderError(err.message) as string);
})

export default app;