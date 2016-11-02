class SubscribeUserToMailingListJob < ActiveJob::Base
  queue_as :default
 
  def perform(email)
    gb = Gibbon::API.new
    gb.lists.subscribe({:id => ENV["MAILCHIMP_LIST_ID"], :email => {:email => email}, :double_option => false})
  end
end