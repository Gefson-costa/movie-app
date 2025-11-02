# Modo Dark/Light - Documentação

## 📋 Visão Geral

O MovieApp agora suporta alternância entre temas claro e escuro, permitindo aos usuários escolher a aparência que melhor se adequa às suas preferências e condições de visualização.

## ✨ Funcionalidades

### Botão de Alternância
- **Desktop**: Botão disponível no menu principal do navbar, ao lado dos filtros (Filmes, Séries, Animações)
- **Mobile**: Item no menu hambúrguer, localizado abaixo das opções de categoria

### Persistência
- A preferência do tema é salva automaticamente no `localStorage`
- O tema é mantido entre sessões do navegador
- Ao retornar ao site, o último tema selecionado é restaurado

### Indicadores Visuais
- **Tema Dark**: Ícone de sol (☀️) com texto "Light"
- **Tema Light**: Ícone de lua (🌙) com texto "Dark"
- Transições suaves entre temas (300ms)

## 🎨 Paletas de Cores

### Tema Dark (Padrão)
```css
--color-primary: #030014      /* Background principal */
--text-primary: #ffffff       /* Texto principal */
--text-secondary: #a8b5db     /* Texto secundário */
--card-bg: #0f0d23           /* Background dos cards */
--navbar-bg: #0f0d23         /* Background do navbar */
--gradient-from: #D6C7FF     /* Gradiente inicial */
--gradient-to: #AB8BFF       /* Gradiente final */
```

### Tema Light
```css
--color-primary: #f5f5f7      /* Background principal */
--text-primary: #1d1d1f       /* Texto principal */
--text-secondary: #424245     /* Texto secundário */
--card-bg: #ffffff           /* Background dos cards */
--navbar-bg: #ffffff         /* Background do navbar */
--gradient-from: #7c6bb3     /* Gradiente inicial */
--gradient-to: #9575cd       /* Gradiente final */
```

## 🔧 Implementação Técnica

### 1. Gerenciamento de Estado (App.jsx)

```javascript
// Estado do tema com valor inicial do localStorage
const [theme, setTheme] = useState(() => {
  const savedTheme = localStorage.getItem('theme')
  return savedTheme || 'dark'
})

// Aplicar tema ao documento
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}, [theme])

// Função de alternância
const toggleTheme = () => {
  setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
}
```

### 2. Componente Navbar

O botão é passado via props:
```javascript
<Navbar 
  theme={theme}
  onToggleTheme={toggleTheme}
  // ... outras props
/>
```

**Botão Desktop:**
```jsx
<button
  className="navbar-link theme-toggle"
  onClick={onToggleTheme}
  aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
>
  <span className="navbar-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
</button>
```

**Botão Mobile:**
```jsx
<button
  className="navbar-menu-item theme-toggle-mobile"
  onClick={() => {
    onToggleTheme()
    setIsOpen(false) // Fecha o menu após alternar
  }}
>
  <span className="navbar-menu-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
  <span className="navbar-menu-text">
    Tema {theme === 'dark' ? 'Claro' : 'Escuro'}
  </span>
</button>
```

### 3. Estilos CSS (index.css)

Os estilos utilizam variáveis CSS customizadas e o atributo `data-theme`:

```css
/* Transições suaves globais */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Variáveis do tema light */
[data-theme="light"] {
  --color-primary: #f5f5f7;
  --text-primary: #1d1d1f;
  /* ... outras variáveis */
}

/* Variáveis do tema dark */
[data-theme="dark"] {
  --color-primary: #030014;
  --text-primary: #ffffff;
  /* ... outras variáveis */
}
```

### 4. Aplicação de Estilos Específicos

Componentes utilizam as variáveis CSS:

```css
.movie-card {
  background: var(--card-bg);
}

.movie-card h3 {
  color: var(--text-primary);
}

/* Estilos específicos por tema quando necessário */
[data-theme="light"] .navbar {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

## 🎯 Componentes Afetados

### Todos os componentes visuais foram adaptados:

1. **Navbar**
   - Background e bordas
   - Links e botões
   - Menu mobile

2. **Cards de Filmes**
   - Background dos cards
   - Texto e metadados
   - Sombras e efeitos

3. **Campo de Busca**
   - Background e bordas
   - Texto e placeholder
   - Botão de limpar

4. **Background e Pattern**
   - Opacidade ajustada por tema
   - Cores de fundo

5. **Títulos e Textos**
   - Cores adaptadas ao contraste
   - Gradientes ajustados

## ♿ Acessibilidade

- Labels descritivos em `aria-label` para leitores de tela
- Indicação clara do tema ativo
- Contraste adequado em ambos os temas (WCAG AA)
- Transições suaves para evitar desconforto visual
- Ícones intuitivos para facilitar compreensão

## 📱 Responsividade

- **Desktop (≥1024px)**: Botão no menu principal
- **Tablet/Mobile (<1024px)**: Botão no menu hambúrguer
- Layout otimizado para ambos os formatos

## 🔄 Como Usar

### Para Usuários:

1. **Desktop**: Clique no botão com ícone de sol/lua no menu superior
2. **Mobile**: Abra o menu hambúrguer e clique em "Tema Claro/Escuro"
3. O tema é aplicado instantaneamente e salvo automaticamente

### Para Desenvolvedores:

#### Adicionar novo componente com suporte a temas:

```css
.meu-componente {
  background: var(--card-bg);
  color: var(--text-primary);
}

/* Estilo específico se necessário */
[data-theme="light"] .meu-componente {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

#### Customizar cores do tema:

Edite as variáveis em `src/index.css`:

```css
[data-theme="light"] {
  --text-primary: #sua-cor;
  /* ... outras variáveis */
}
```

## 🐛 Troubleshooting

### O tema não persiste após recarregar:
- Verifique se o `localStorage` está habilitado no navegador
- Certifique-se de que não há limpeza automática de dados

### Cores não mudam em algum componente:
- Verifique se o componente está usando variáveis CSS
- Certifique-se de que não há cores hardcoded

### Transições muito lentas/rápidas:
- Ajuste a duração em `index.css`:
  ```css
  * {
    transition: background-color 0.3s ease, /* ajuste aqui */ ...
  }
  ```

## 📝 Notas Importantes

1. O tema padrão é **dark mode**
2. A persistência usa `localStorage` com a chave `theme`
3. Transições globais aplicadas em todos os elementos
4. Suporte total para todos os navegadores modernos
5. Sem dependências externas

## 🚀 Melhorias Futuras

- [ ] Detecção automática de preferência do sistema (`prefers-color-scheme`)
- [ ] Modo de contraste alto
- [ ] Mais opções de temas (ex: sepia, alto contraste)
- [ ] Animações personalizadas na transição
- [ ] Atalho de teclado para alternar tema

## 📚 Referências

- [MDN - prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Web.dev - Color schemes](https://web.dev/color-scheme/)
- [WCAG - Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Data de Implementação**: Novembro 2025  
**Versão**: 1.0  
**Autor**: Cline AI Assistant
