
import { useEffect, useState } from 'react'
import {
  Users,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  Trash2,
  Pencil,
  X,
  Plus
} from 'lucide-react'
import './App.css'

const API = 'https://api-clientes-favoritos.itamarteixeirasousa747.workers.dev'

function App() {
  const [pagina, setPagina] = useState('inicio')
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [erro, setErro] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [clienteEditando, setClienteEditando] = useState(null)
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [favoritos, setFavoritos] = useState([])

  async function atualizarClientes() {
    const resposta = await fetch(`${API}/clients`)
    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.error || 'Erro ao carregar clientes.')
    }

    setClientes(dados.clients || [])
  }

  async function carregarProdutos() {
    const resposta = await fetch(`${API}/products`)

    if (!resposta.ok) {
      throw new Error('Erro ao carregar produtos.')
    }

    const dados = await resposta.json()

    setProdutos(
      Array.isArray(dados)
        ? dados
        : dados.products || []
    )
  }

  async function cadastrarCliente(e) {
    e.preventDefault()
    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(`${API}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nome,
          email,
          password: senha
        })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.error || 'Não foi possível cadastrar.')
      }

      await atualizarClientes()

      setMensagem('Cliente cadastrado com sucesso!')
      setNome('')
      setEmail('')
      setSenha('')

    } catch (error) {
      setErro(error.message)
    }
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este cliente?'
    )

    if (!confirmar) return

    try {
      const resposta = await fetch(`${API}/clients/${id}`, {
        method: 'DELETE'
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao excluir cliente.')
      }

      await atualizarClientes()

      if (String(clienteSelecionado) === String(id)) {
        setClienteSelecionado('')
        setFavoritos([])
      }

      setMensagem('Cliente excluído com sucesso!')
      setErro('')

    } catch (error) {
      setErro(error.message)
    }
  }

  function iniciarEdicao(cliente) {
    setClienteEditando(cliente)
    setNome(cliente.name)
    setEmail(cliente.email)
    setSenha('')
    setMensagem('')
    setErro('')
  }

  function cancelarEdicao() {
    setClienteEditando(null)
    setNome('')
    setEmail('')
    setSenha('')
  }

  async function editarCliente(e) {
    e.preventDefault()
    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(
        `${API}/clients/${clienteEditando.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nome,
            email
          })
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao atualizar cliente.')
      }

      await atualizarClientes()

      setClienteEditando(null)
      setNome('')
      setEmail('')
      setSenha('')
      setMensagem('Cliente atualizado com sucesso!')

    } catch (error) {
      setErro(error.message)
    }
  }

  async function carregarFavoritos(id) {
    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(
        `${API}/clients/${id}/favorites`
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao carregar favoritos.')
      }

      setFavoritos(dados.favorites || [])

    } catch (error) {
      setErro(error.message)
      setFavoritos([])
    }
  }

  async function selecionarCliente(id) {
    setClienteSelecionado(id)
    setFavoritos([])
    setMensagem('')
    setErro('')

    if (id) {
      await carregarFavoritos(id)
    }
  }

  async function adicionarFavorito(produtoId) {
    if (!clienteSelecionado) {
      setErro('Selecione um cliente primeiro.')
      return
    }

    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(
        `${API}/clients/${clienteSelecionado}/favorites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: Number(produtoId)
          })
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao adicionar favorito.')
      }

      await carregarFavoritos(clienteSelecionado)
      setMensagem('Produto adicionado aos favoritos!')

    } catch (error) {
      setErro(error.message)
    }
  }

  async function removerFavorito(produtoId) {
    const confirmar = window.confirm(
      'Deseja remover este produto dos favoritos?'
    )

    if (!confirmar) return

    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(
        `${API}/clients/${clienteSelecionado}/favorites/${produtoId}`,
        {
          method: 'DELETE'
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao remover favorito.')
      }

      await carregarFavoritos(clienteSelecionado)
      setMensagem('Favorito removido com sucesso!')

    } catch (error) {
      setErro(error.message)
    }
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        await atualizarClientes()
        await carregarProdutos()
      } catch (error) {
        setErro(error.message)
      }
    }

    carregarDados()
  }, [])

  const menu = [
    { id: 'inicio', nome: 'Início', icon: LayoutDashboard },
    { id: 'clientes', nome: 'Clientes', icon: Users },
    { id: 'produtos', nome: 'Produtos', icon: ShoppingBag },
    { id: 'favoritos', nome: 'Favoritos', icon: Heart }
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Minha API</h2>
        <p className="subtitulo">Clientes e Favoritos</p>

        <nav>
          {menu.map(item => {
            const Icone = item.icon

            return (
              <button
                key={item.id}
                className={pagina === item.id ? 'ativo' : ''}
                onClick={() => {
                  setPagina(item.id)
                  setMensagem('')
                  setErro('')
                }}
              >
                <Icone size={19} />
                {item.nome}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="conteudo">
        <header>
          <h1>{menu.find(item => item.id === pagina)?.nome}</h1>
          <span>API Clientes e Favoritos</span>
        </header>

        {erro && <p className="erro">{erro}</p>}

        {pagina === 'inicio' && (
          <section>
            <h2>Bem-vindo ao painel!</h2>
            <p>Gerencie seus clientes, produtos e favoritos.</p>

            <div className="cards">
              <div className="card">
                <Users size={28} />
                <h3>Clientes</h3>
                <strong>{clientes.length}</strong>
              </div>

              <div className="card">
                <ShoppingBag size={28} />
                <h3>Produtos</h3>
                <strong>{produtos.length}</strong>
              </div>

              <div className="card">
                <Heart size={28} />
                <h3>Favoritos</h3>
                <strong>{favoritos.length}</strong>
              </div>
            </div>
          </section>
        )}

        {pagina === 'clientes' && (
          <section>
            <h2>
              {clienteEditando
                ? 'Editar cliente'
                : 'Cadastrar novo cliente'}
            </h2>

            <form
              className="formulario"
              onSubmit={clienteEditando
                ? editarCliente
                : cadastrarCliente}
            >
              <input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              {!clienteEditando && (
                <input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
              )}

              <button type="submit">
                {clienteEditando
                  ? 'Salvar alterações'
                  : 'Cadastrar cliente'}
              </button>

              {clienteEditando && (
                <button type="button" onClick={cancelarEdicao}>
                  <X size={16} /> Cancelar edição
                </button>
              )}
            </form>

            {mensagem && <p className="sucesso">{mensagem}</p>}

            <h2>Clientes cadastrados</h2>

            {clientes.map(cliente => (
              <div className="item" key={cliente.id}>
                <strong>{cliente.name}</strong>
                <span>{cliente.email}</span>

                <button
                  onClick={() => iniciarEdicao(cliente)}
                  className="botao-editar"
                >
                  <Pencil size={16} /> Editar
                </button>

                <button
                  className="botao-excluir"
                  onClick={() => excluirCliente(cliente.id)}
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            ))}
          </section>
        )}

        {pagina === 'produtos' && (
          <section>
            <h2>Produtos disponíveis</h2>

            {produtos.length === 0 && (
              <p>Nenhum produto encontrado.</p>
            )}

            {produtos.map(produto => (
              <div className="item" key={produto.id}>
                <strong>{produto.title}</strong>

                <span>
                  {Number(produto.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>

                <button
                  className="botao-favorito"
                  onClick={() => {
                    setPagina('favoritos')
                    adicionarFavorito(produto.id)
                  }}
                >
                  <Heart size={16} /> Favoritar
                </button>
              </div>
            ))}
          </section>
        )}

        {pagina === 'favoritos' && (
          <section>
            <h2>Gerenciar favoritos</h2>

            <label htmlFor="cliente-favoritos">
              Selecione um cliente:
            </label>

            <select
              id="cliente-favoritos"
              value={clienteSelecionado}
              onChange={e => selecionarCliente(e.target.value)}
            >
              <option value="">Escolha um cliente</option>

              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.name} - {cliente.email}
                </option>
              ))}
            </select>

            {mensagem && <p className="sucesso">{mensagem}</p>}

            {clienteSelecionado && (
              <>
                <h2>Produtos disponíveis</h2>

                {produtos.map(produto => (
                  <div className="item" key={produto.id}>
                    <strong>{produto.title}</strong>

                    <span>
                      {Number(produto.price).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>

                    <button
                      className="botao-favorito"
                      onClick={() => adicionarFavorito(produto.id)}
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                ))}

                <h2>Favoritos deste cliente</h2>

                {favoritos.length === 0 && (
                  <p>Este cliente ainda não possui favoritos.</p>
                )}

                {favoritos.map((favorito, indice) => {
                  const produtoId = favorito.product_id ??
                    favorito.productId ??
                    favorito.product?.id

                  const produto = produtos.find(
                    item => Number(item.id) === Number(produtoId)
                  )

                  return (
                    <div
                      className="item"
                      key={favorito.id ?? produtoId ?? indice}
                    >
                      <strong>
                        {produto?.title ||
                          favorito.title ||
                          favorito.product?.title ||
                          `Produto ${produtoId}`}
                      </strong>

                      <button
                        className="botao-excluir"
                        onClick={() => removerFavorito(produtoId)}
                        disabled={!produtoId}
                      >
                        <Trash2 size={16} /> Remover
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
