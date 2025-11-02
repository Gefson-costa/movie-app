# 🍔 Menu Hambúrguer - Documentação

## 📋 O que foi implementado

Foi criado um menu de navegação responsivo e moderno com menu hambúrguer para dispositivos móveis e menu horizontal para desktop.

---

## 🎯 Funcionalidades

### **1. Menu Responsivo**
- **Desktop (≥768px):** Menu horizontal no topo com botões de navegação
- **Mobile (<768px):** Menu hambúrguer que abre um painel lateral

### **2. Filtros de Conteúdo**
- 🎬 **Filmes** - Para buscar e filtrar filmes
- 📺 **Séries** - Para buscar e filtrar séries
- 🎨 **Animações** - Para buscar e filtrar animações

### **3. Animações Modernas**
- Transição suave do botão hambúrguer (transforma em X)
- Slide-in do menu mobile da direita
- Overlay com blur de fundo
- Estados hover e active nos botões

### **4. Acessibilidade**
- Atributos ARIA (`aria-label`, `aria-expanded`)
- Navegação por teclado
- Fecha automaticamente ao clicar em um item

---

## 📁 Arquivos Criados/Modificados

### **Novo Arquivo:**
- `src/components/Navbar.jsx` - Componente do menu de navegação

### **Arquivos Modificados:**
- `src/App.jsx` - Importado e adicionado o componente Navbar
- `src/index.css` - Adicionados estilos do navbar e menu

---

## 🎨 Design

### **Características Visuais:**
- **Fundo:** Escuro com blur (`backdrop-blur-md`)
- **Cor de destaque:** Gradiente roxo (`#D6C7FF` → `#AB8BFF`)
- **Transições:** 300ms para todas as animações
- **Sombras:** Overlay com sombra suave
- **Responsivo:** Adapta-se automaticamente ao tamanho da tela

### **Estados:**
- **Normal:** Texto cinza claro
- **Hover:** Fundo semi-transparente + texto branco
- **Active:** Gradiente roxo no texto (filtro selecionado)

---

## 🔧 Como Funciona

### **Estado do Menu:**
```javascript
const [isOpen, setIsOpen] = useState(false)  // Controla se menu mobile está aberto
const [activeFilter, setActiveFilter] = useState('movies')  // Filtro ativo
```

### **Comportamento:**
1. **Desktop:** Menu sempre visível horizontalmente
2. **Mobile:** Botão hambúrguer no canto superior direito
3. **Ao clicar no hambúrguer:** Menu desliza da direita + overlay aparece
4. **Ao clicar em item:** Menu fecha automaticamente
5. **Ao redimensionar:** Menu fecha se voltar para desktop

### **Prevenção de Scroll:**
Quando o menu mobile está aberto, o scroll do body é bloqueado para melhor UX.

---

## 🎯 Uso no Código

### **No App.jsx:**
```jsx
import Navbar from "./components/Navbar";

return (
  <main>
    <Navbar />
    {/* resto do conteúdo */}
  </main>
)
```

### **Filtros Disponíveis:**
O componente mantém um estado `activeFilter` que pode ser usado para filtrar conteúdo:
- `'movies'` - Filmes
- `'series'` - Séries  
- `'anime'` - Animações

**Nota:** Atualmente os filtros apenas mudam visualmente. Para implementar a funcionalidade de filtro real, você precisaria:
1. Passar o `activeFilter` como prop para o componente pai
2. Usar esse filtro na função `fetchMovies` para buscar por tipo específico

---

## 🔄 Próximos Passos (Opcional)

### **1. Conectar Filtros à API:**
Modificar a função `fetchMovies` em `App.jsx` para usar o filtro ativo:
```javascript
const fetchMovies = async (query = '', type = 'movie') => {
  // type pode ser 'movie', 'tv', ou 'anime'
  // Adaptar endpoint da TMDB conforme necessário
}
```

### **2. Passar Estado para o Pai:**
Em `Navbar.jsx`, adicionar callback:
```javascript
const Navbar = ({ onFilterChange }) => {
  const handleFilterClick = (filter) => {
    setActiveFilter(filter)
    setIsOpen(false)
    onFilterChange?.(filter) // Notifica o componente pai
  }
}
```

### **3. Adicionar Mais Opções:**
- Favoritos
- Histórico de buscas
- Configurações
- Sobre

---

## 📱 Breakpoints

- **Mobile:** < 768px (menu hambúrguer)
- **Desktop:** ≥ 768px (menu horizontal)

---

## 🎓 Conceitos Aprendidos

1. **Responsive Design:** Media queries via Tailwind
2. **State Management:** useState para controlar menu
3. **Side Effects:** useEffect para limpar listeners
4. **Animações CSS:** Transforms e transitions
5. **Acessibilidade:** ARIA labels e navegação por teclado
6. **UX:** Prevenção de scroll, overlay, fechamento automático

---

## 🐛 Troubleshooting

### **Menu não aparece:**
- Verifique se o componente Navbar foi importado e adicionado no App.jsx
- Confirme que os estilos CSS foram carregados

### **Logo não aparece:**
- O componente procura por `/logo.png` na pasta `public`
- Se não houver logo, o texto "MovieApp" aparecerá como fallback

### **Menu não fecha:**
- Verifique se o JavaScript está habilitado
- Confirme que não há erros no console

---

**Menu criado com sucesso! 🎉**

