import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TypeCollaborator from '../views/auth/TypeCollaborator.vue'
import Cadastro from '../views/register/Cadastro.vue'
import CadastroAdmin from '../views/register/CadastroAdmin.vue'
import AdminHome from '../views/AdminViews/AdminHome.vue'
import EmailPage from '../views/AdminViews/EmailView.vue'
import CertificatePage from '../views/AdminViews/CertificateView.vue'
import StockView from '../views/AdminViews/StockView.vue'         
import ProductsView from '../views/AdminViews/ProductsView.vue'   
import LoginAdmin from '../views/auth/LoginAdmin.vue'
import LoginClient from '../views/auth/LoginClient.vue'
import LoginDriver from '../views/auth/LoginDriver.vue'
import AccessDenied from '../views/errors/404.vue'
import ClientsListView from '../views/AdminViews/ClientsListView.vue'
import ClientHome from '../views/ClientViews/ClientHome.vue'

const routes = [
  // Rotas de autenticação e cadastro
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/tipo-colaborador',
    name: 'TypeCollaborator',
    component: TypeCollaborator
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: Cadastro
  },
  {
    path: '/cadastro-admin',
    name: 'cadastro-admin',
    component: CadastroAdmin
  },
  {
    path: '/login',
    name: 'login',
    component: LoginClient
  },
  {
    path: '/login-admin',
    name: 'login-admin', 
    component: LoginAdmin
  },
  {
    path: '/login-motorista',
    name: 'login-motorista',
    component: LoginDriver
  },
  // Rotas de usuário
  {
    path: '/dashboard-admin',
    name: 'dashboard-admin',
    component: AdminHome
  },
  {
    path: '/dashboard-client',
    name: 'dashboard-cliente',
    component: ClientHome
  },

  // Rotas de administração
  {
    path: '/enviar-email',
    name: 'email',
    component: EmailPage,
    meta: { requiresAuth: true, role: 'admin' } 
  },
  {
    path: '/criar-certificado',
    name: 'certificado',
    component: CertificatePage,
    meta: { requiresAuth: true, role: 'admin' } 
  },
  {
    path: '/lista-clientes',
    name: 'lista-clientes',
    component: ClientsListView,
    meta: { requiresAuth: true, role: 'admin' } 
  },
  {
    path: '/lista-estoques',
    name: 'lista-estoques',
    component: StockView,
    meta: { requiresAuth: true, role: 'admin' } 
  },
  {
    path: '/lista-produtos',
    name: 'lista-produtos',
    component: ProductsView,
    meta: { requiresAuth: true, role: 'admin' } 
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDenied
  },
  // Rotas de erro
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/errors/404.vue') 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.role;
  const requiredLevel = to.meta.level; 

  const accessToken = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role'); 
  const userLevel = localStorage.getItem('user_level');

  if (to.name === 'login' || to.name === 'login-admin' || to.name === 'cadastro' || to.name === 'cadastro-admin') {
    next();
    return;
  }
  
  if (requiresAuth) {
    if (!accessToken) {
      console.warn('Nenhum token encontrado.');
      next('/access-denied');
    } else {
      if (requiredRole && userRole !== requiredRole) {
        console.warn(`Acesso negado: Requer role '${requiredRole}', mas o usuário é '${userRole}'`);
        next('/access-denied'); 
      } else if (requiredRole === 'admin' && requiredLevel) {
        const adminLevels = { 'Junior': 3, 'Pleno': 2, 'Master': 1 }; 
        const userLevelValue = adminLevels[userLevel];
        const requiredLevelValue = adminLevels[requiredLevel];

        if (userLevelValue > requiredLevelValue) { 
          console.warn(`Acesso negado: Requer nível '${requiredLevel}', mas o admin é '${userLevel}'`);
          next('/access-denied'); 
        } else {
          next(); 
        }
      } else {
        next();
      }
    }
  } else {
    next(); 
  }
});

export default router