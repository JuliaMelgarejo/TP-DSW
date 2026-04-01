import { Routes } from '@angular/router';
import { AnimalComponent } from './components/animal/animal.component.js';
import { AnimalFormComponent } from './components/animal/animal-form/animal-form.component.js';
import { AnimalDetailsComponent } from './components/animal/animal-details/animal-details.component.js';
import { ShelterComponent } from './components/shelter/shelter.component.js';
import { ShelterDetailComponent } from './components/shelter/shelter-detail/shelter-detail.component.js';
import { ShelterFormComponent } from './components/shelter/shelter-form/shelter-form.component.js';
import { PersonComponent } from './components/person/person.component.js';
import { PersonFormComponent } from './components/person/person-form/person-form.component.js';
import { PersonDetailComponent } from './components/person/person-detail/person-detail.component.js';
import { HomeComponent } from './components/home/home.component.js';
import { AdoptAnimalComponent } from './components/adopt-animal/adopt-animal.component.js';
import { LoginComponent } from './components/login/login.component.js';
import { SignInComponent } from './components/sign-in/sign-in.component.js';
import { authGuard } from './utils/auth.guard.js';
import { BreedDetailComponent } from './components/breed/breed-detail/breed-detail.component.js';
import { BreedComponent } from './components/breed/breed.component.js';
import { BreedFormComponent } from './components/breed/breed-form/breed-form.component.js';
import { VetComponent } from './components/vet/vet.component.js';
import { VetFormComponent } from './components/vet/vet-form/vet-form.component.js';
import { VetDetailComponent } from './components/vet/vet-detail/vet-detail.component.js';
import { RescueComponent } from './components/rescue/rescue.component.js';
import { RescueFormComponent } from './components/rescue/rescue-form/rescue-form.component.js';
import { RescueDetailComponent } from './components/rescue/rescue-detail/rescue-detail.component.js';
import { AnimalPageComponent } from './components/animal/animal-page/animal-page/animal-page.component.js';
import { SignInShelterAccountComponent } from './components/sign-in/sign-in-shelter/sign-in-shelter-account.component.js';
import { SignInShelterDetailsComponent } from './components/sign-in/sign-in-shelter/sign-in-shelter-details.component.js';
import { ProductComponent } from './components/product/product.component.js';
import { ProductFormComponent } from './components/product/product-form/product-form.component.js';
import { MyAdoptionsComponent } from './components/adopt-animal/my-adoptions/my-adoptions.component.js';
import { MyAdoptionDetailComponent } from './components/adopt-animal/my-adoption-detail/my-adoption-detail.component.js';
import { AdoptListComponent } from './components/adopt-animal/adopt-list/adopt-list.component.js';
import { ShelterAdoptionDetailComponent } from './components/adopt-animal/shelter-adoption-detail/shelter-adoption-detail.component.js';
import { ProductDetailComponent } from './components/product/product-detail/product-detail.component.js';
import { CartComponent } from './components/cart/cart.component.js';
import { OrderShelterComponent } from './components/order/order-shelter/order-shelter.component.js';
import { OrderComponent } from './components/order/order.component.js';
import { OrderShelterDetailComponent } from './components/order/order-shelter-detail/order-shelter-detail.component.js';
import { guestGuard } from './utils/guest.guard.js';
import { ShelterPublicDetailComponent } from './components/shelter/shelter-public/shelter-public-detail/shelter-public-detail.component.js';
import { PersonProfileComponent } from './components/person/person-profile/person-profile.component.js';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signIn', component: SignInComponent, canActivate: [guestGuard] },
  { path: 'signIn/user', component: SignInComponent, canActivate: [guestGuard] },
  { path: 'signIn/shelter/account', component: SignInShelterAccountComponent, canActivate: [guestGuard] },
  { path: 'signIn/shelter/details', component: SignInShelterDetailsComponent, canActivate: [guestGuard] },

  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  {path: 'home', component: HomeComponent, canActivate:[authGuard]},

  {path: 'animal/create', component: AnimalFormComponent, canActivate:[authGuard], data: { roles: ['ROLE_ADMIN'] }},
  {path: 'animal', component: AnimalComponent, canActivate:[authGuard]},
  {path: 'animal/:id', component:AnimalPageComponent, canActivate:[authGuard]},
  {path: 'animal/:id/shelter', component: AnimalDetailsComponent, canActivate:[authGuard], data: { roles: ['SHELTER'] }},

  { path: 'shelter', component: ShelterComponent, canActivate:[authGuard] },
  { path: 'shelters/:id', component: ShelterPublicDetailComponent, canActivate:[authGuard] },
  { path: 'my-shelter', component: ShelterDetailComponent, canActivate:[authGuard], data: { roles: ['SHELTER'] } },
  { path: 'my-shelter/:id', component: ShelterDetailComponent, canActivate:[authGuard], data: { roles: ['SHELTER'] } },

  {path: 'person', component: PersonComponent, canActivate:[authGuard], data: { roles: ['ADMIN'] }},
  {path: 'person/create', component: PersonFormComponent, canActivate:[authGuard]},
  {path: 'person/:id', component: PersonDetailComponent, canActivate:[authGuard]},
  { path: 'profile', component: PersonProfileComponent, canActivate:[authGuard] },
  { path: 'profile/edit/:id', component: PersonDetailComponent, canActivate:[authGuard] },

  {path: 'breed', component: BreedComponent, canActivate:[authGuard]},
  {path: 'breed/create', component: BreedFormComponent, canActivate:[authGuard]},
  {path: 'breed/:id', component: BreedDetailComponent, canActivate:[authGuard]},

  {path: 'vet', component: VetComponent, canActivate:[authGuard]},
  {path: 'vet/create', component: VetFormComponent, canActivate:[authGuard]},
  {path: 'vet/:id', component: VetDetailComponent,  canActivate:[authGuard]},

  {path: 'rescue', component:RescueComponent, canActivate:[authGuard], data: { roles: ['SHELTER'] }},
  {path: 'rescue/create', component:RescueFormComponent, canActivate:[authGuard]},
  {path: 'rescue/:id', component:RescueDetailComponent, canActivate:[authGuard]},

  { path: 'adopt/:id', component: AdoptAnimalComponent, canActivate:[authGuard] },

  { path: 'product', component: ProductComponent, canActivate: [authGuard] },
  { path: 'product/create', component: ProductFormComponent, canActivate: [authGuard], data: { roles: ['SHELTER'] } },
  { path: 'product/edit/:id', component: ProductFormComponent, canActivate: [authGuard], data: { roles: ['SHELTER'] } },
  { path: 'product/:id',component: ProductDetailComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },

  { path: 'order', component: OrderComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderShelterComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderShelterDetailComponent, canActivate: [authGuard] },
  { path: 'order-shelter/:id', component: OrderShelterDetailComponent, canActivate: [authGuard], data: { roles: ['SHELTER'] } },
  { path: 'order-shelter', component: OrderShelterComponent, canActivate: [authGuard], data: { roles: ['SHELTER'] } },


  { path: 'my-adoptions', component: MyAdoptionsComponent, canActivate:[authGuard] },
  { path: 'my-adoptions/:id', component: MyAdoptionDetailComponent, canActivate:[authGuard] },
  { path: 'animal/:id/adoptions', component: AdoptListComponent, canActivate: [authGuard], data: { roles: ['SHELTER'] } },
  { path: 'shelter-adoptions', component: AdoptListComponent, canActivate:[authGuard], data: { roles: ['SHELTER'] } },
  { path: 'shelter-adoptions/:id', component: ShelterAdoptionDetailComponent, canActivate:[authGuard], data: { roles: ['SHELTER'] } },

  { path: '**',redirectTo: 'login',pathMatch: 'full' }
];
