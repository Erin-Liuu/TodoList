import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTodoStore = defineStore('todo', () => {
    let todos = ref([])
    // let todos = ref([
    //     {
    //         id: 1,
    //         taskName: "Test",
    //         completed: true,
    //         starred: true,
    //         deadline: new Date(2025, 6, 5)
    //     },
    //     {
    //         id: 2,
    //         taskName: "Test2",
    //         completed: false,
    //         starred: false,
    //         comment: "abc",
    //         deadline: new Date(2025, 9, 5)
    //     },
    //     {
    //         id: 3,
    //         taskName: "Test3",
    //         completed: false,
    //         starred: false,
    //         comment: "dfe",
    //         deadline: new Date(2021, 9, 28)
    //     },
    //     {
    //         id: 4,
    //         taskName: "Test4",
    //         completed: false,
    //         starred: true,
    //         comment: "",
    //         deadline: null
    //     },
    //     {
    //         id: 5,
    //         taskName: "Test5",
    //         completed: false,
    //         starred: true,
    //         comment: "",
    //         deadline: null
    //     }
    // ])

    let sortToggle = ref(false)

    // localStorage.setItem('todoList', JSON.stringify(todos.value))
    // 初始化時從 localStorage 讀取
    const saved = localStorage.getItem('todoList')
    if (saved) {
        todos.value = JSON.parse(saved)
    }
    watch(
        todos.value,
        (newTodos) => {
            localStorage.setItem('todoList', JSON.stringify(newTodos))
        },
        { deep: true }
    )

    function addTask(text) {
        todos.value.unshift({ id: crypto.randomUUID(), taskName: text, completed: false })
    }
    function updateTask(id, data) {
        const todo = todos.value.find(t => t.id === id)
        if (todo) {
            todo.id = crypto.randomUUID()
            todo.taskName = data.text
            todo.deadline = data.deadline
            todo.comment = data.comment
        }
    }
    function toggleTask(id) {
        const todo = todos.value.find(t => t.id === id)
        if (todo) todo.completed = !todo.completed
    }
    function deleteTask(id) {
        todos.value.splice(id, 1);
        // console.log(todos.value);
    }
    function deleteAllTask() {
        todos.value = []
    }
    function toggleStar(id) {
        const todo = todos.value.find(t => t.id === id)
        if (todo) todo.starred = !todo.starred
    }

    return {
        todos,
        sortToggle,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        deleteAllTask,
        toggleStar
    }
})