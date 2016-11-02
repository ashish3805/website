class WelcomeController < ApplicationController
  def index
    @preregistration = Preregistration.new    
  end
end
