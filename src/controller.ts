import { Context, Get, Post, Patch, Http, Body } from "@dikur/http";
import type { Context as HonoContext } from "hono";
import { renderTodos } from "./components";
import { titleValidator, toggleValidator } from "./validators";
import { Env, TodoItem, USERCOOKIENAME } from ".";


@Http()
export class TodoController {

    @Get("/")
    async index(@Context() ctx: HonoContext<{Bindings: Env}>) {
        let id = this.getUser(ctx, false) || crypto.randomUUID();
        let todos: TodoItem[] = (await ctx.env.todo_db.prepare(`select id, title, done from todos where userId = ?`)
        .bind(id)
        .all<TodoItem>()).results || [];

        let result = renderTodos(todos) as string;
        ctx.cookie(USERCOOKIENAME, id);
        return ctx.html(result);
    }

    @Post("/add")
    async create(
            @Context() ctx: HonoContext<{Bindings: Env}>,
            @Body(titleValidator) title: string
        ) {
            let id = this.getUser(ctx);

            await ctx.env.todo_db.prepare(`INSERT INTO todos (title, done, userId) VALUES (?, false, ?)`)
            .bind(title, id)
            .run();

            return ctx.redirect('/');
    }

    @Patch('/toggle')
    async toggle(
        @Context() ctx: HonoContext<{Bindings: Env}>,
        @Body(toggleValidator) { done, todoId }: Awaited<ReturnType<typeof toggleValidator>>
    ) {
        let id = this.getUser(ctx);
        await ctx.env.todo_db.prepare(`UPDATE todos SET done = ? WHERE id = ? and userId = ?`)
        .bind(done, todoId, id)
        .run();

        return ctx.redirect('/');
    }

    private getUser(ctx: HonoContext, validate = true) {
        let id = ctx.req.cookie(USERCOOKIENAME);
        if (!id && validate) {
            throw new Error("user not logged in");
        }
        return id;
    }
}