import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo} from '@angular/fire/auth-guard';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToItems = () => redirectLoggedInTo(['login']);
const belongsToAccount = (next) => hasCustomClaim(`account-${next.params.id}`);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin}
  },
  {
    path: 'tabs',
    loadChildren: () => import('./components/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin}
  },
  {
    path: 'login',
    loadChildren: () =>
    import("./pages/login/login.module").then((m) => m.LoginPageModule),  
  },
  {
    path: "register",
    loadChildren: () =>
      import("./pages/register/register.module").then(
        (m) => m.RegisterPageModule
      ),
  },
  {
    path: 'about-me',
    loadChildren: () => import('./pages/about-me/about-me.module').then( m => m.AboutMePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
