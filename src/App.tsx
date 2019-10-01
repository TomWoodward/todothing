import React from 'react';

// types

interface Todo {
  text: string;
  resolved: boolean
}
interface Services {
  updateTodo: (old: Todo, updated: Todo) => void;
  removeTodo: (todo: Todo) => void;
  addTodo: (todo: Todo) => void;
}

// utils

const isComplete = (todo: Todo) => todo.resolved === true;

const not = <P extends (...args: any[]) => boolean>(predicate: P) =>
  (...args: Parameters<P>) => !predicate(...args);

// context

const throwNoProvider = () => {
  throw new Error('no service provider')
};
const ServiceContext = React.createContext<Services>({
  updateTodo: throwNoProvider,
  removeTodo: throwNoProvider,
  addTodo: throwNoProvider,
});

// components

type TodoListItemProps = {todo: Todo, remove: () => void, save: (newer: Todo) => void};

const TodoListItem: React.FC<TodoListItemProps> = ({todo, remove, save}) => <div>
  <input type="checkbox" checked={todo.resolved} onChange={() => save({
    ...todo,
    resolved: !todo.resolved,
  })} />
  {todo.text}
  <button onClick={remove}>remove</button>
</div>;


type TodoListProps = {todos: Todo[]};

const TodoList: React.FC<TodoListProps> = ({todos}) => <ServiceContext.Consumer>
  {({updateTodo, removeTodo}) => <React.Fragment>
    {todos.map(todo => <TodoListItem
      todo={todo}
      remove={() => removeTodo(todo)}
      save={(updated: Todo) => updateTodo(todo, updated)}
    />)}
  </React.Fragment>}
</ServiceContext.Consumer>;

const CreateTodoForm: React.FC = () => {
  const [newText, setNewText] = React.useState<string>('');
  const createTodo = (addTodo: Services['addTodo']) => (e: React.FormEvent) => {
    e.preventDefault();
    addTodo({
      text: newText,
      resolved: false,
    });
    setNewText('');
  };

  return <ServiceContext.Consumer>
    {({addTodo}) => <form onSubmit={createTodo(addTodo)}>
      <input value={newText} onChange={e => setNewText(e.target.value)} />
    </form>}
  </ServiceContext.Consumer>;
};

const App: React.FC = () => {
  const [todos, setTodos] = React.useState<Todo[]>([]);

  const removeTodo = (todo: Todo) => setTodos(todos.filter(search => search !== todo));
  const updateTodo = (old: Todo, updated: Todo) => setTodos(todos.map(todo => todo === old ? updated : todo));
  const addTodo = (todo: Todo) => setTodos([...todos, todo]);

  return <ServiceContext.Provider value={{removeTodo, updateTodo, addTodo}}>
    <CreateTodoForm />

    <h1>todo</h1>
    <TodoList todos={todos.filter(not(isComplete))} />

    <h1>complete</h1>
    <TodoList todos={todos.filter(isComplete)} />

  </ServiceContext.Provider>;
}

export default App;
