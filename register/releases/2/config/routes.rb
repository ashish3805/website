Rails.application.routes.draw do
  resources :preregistrations, only: [:create], path: ''

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  post '/s', to: 'welcome#subscribe'
  root 'welcome#index'
end
