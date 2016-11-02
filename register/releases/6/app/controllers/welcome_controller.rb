class WelcomeController < ApplicationController
  def index
    @preregistration = Preregistration.new    
  end

  def subscribe
    SubscribeUserToMailingListJob.perform_later(params[:email])
    redirect_to :root, flash: { subscription_notice: "You have been successfully subscribed!" }
  end
end
