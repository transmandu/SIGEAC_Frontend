import { LoginForm } from '@/components/forms/ajustes/LoginForm'
import { ThemeToggler } from '@/components/layout/ThemeToggler'
import Logo from '@/components/misc/Logo'

const Login = () => {
  return (
    <div className="h-dvh w-dvw">
      <div className="flex flex-col lg:flex-row mx-auto h-full items-center justify-between">
        <div className="w-full flex justify-end p-4 lg:hidden">
          <ThemeToggler />
        </div>
        <div className="flex h-[350px] w-[250px] lg:w-full justify-center items-center">
          <Logo />
        </div>
        <div className="h-full w-full flex lg:items-center justify-center dark:bg-slate-900 lg:bg-primary lg:dark:bg-primary/70">
          <div className="flex flex-col space-y-4 lg:bg-white  lg:dark:bg-black p-2 lg:p-12 lg:shadow-lg rounded-lg">
            <div className="hidden lg:flex w-full justify-end">
              <ThemeToggler />
            </div>
            <h1 className="text-center text-3xl font-bold">Ingrese al Sistema</h1>
            <p className="text-center font-light text-sm text-muted-foreground">Por favor, inicie sesión con sus credenciales para ingresar.</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
