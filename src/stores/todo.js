import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', {
    state: () => ({
        todos: [
            {
                id: 1,
                taskName: "Test",
                completed: true,
                starred: true,
                deadline: new Date(2025,6,5)
            },
            {
                id: 2,
                taskName: "Test2",
                completed: false,
                starred: false,
                comment: "abc",
                deadline: new Date(2025,9,5)
            },
            {
                id: 3,
                taskName: "Test3",
                completed: false,
                starred: false,
                comment: "dfe",
                deadline: new Date(2021,9,28)
            }
        ]
    }),
    actions: {
        addTask(text) {
            this.todos.push({ id: crypto.randomUUID(), taskName: text, completed: false })
            console.log(this.todos);
            
        },
        updateTask(id, data) {
            const todo = this.todos.find(t => t.id === id)
            if (todo) {
                todo.id = crypto.randomUUID()
                todo.taskName = data.text
                todo.deadline = data.deadline
                todo.comment = data.comment
            }
        },
        toggleTask(id) {
            const todo = this.todos.find(t => t.id === id)
            if (todo) todo.completed = !todo.completed
        },
        deleteTask(id) {
            this.todos.splice(id, 1);
        },
        deleteAllTask() {
            this.todos = []
        },
        toggleStar(id) {
            const todo = this.todos.find(t => t.id === id)
            if (todo) todo.starred = !todo.starred
        },
    }
})