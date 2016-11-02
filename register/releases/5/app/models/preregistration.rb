class Preregistration < ApplicationRecord
  after_initialize :default_values
  after_create :subscribe_user_to_mailing_list
  enum cluster: [:home, :wallet, :users, :music, :watch, :learn, :show, :pblic]
  validates :cluster, inclusion: { in: clusters.keys }  
  validates :domain, exclusion: { in: ['brainec', 'nebulis'] }
  validates :domain, length: { maximum: 16 }
  validates :domain, uniqueness: { scope: :cluster }
  validates :email, uniqueness: true 

  def self.get_clusters    
    self.clusters.map do |k,v|
      if k == "pblic" then
        { "/public" => k }
      else
        { "/#{k.to_s}" => k }
      end
    end.reduce(:merge)
  end

  private
    def subscribe_user_to_mailing_list
      SubscribeUserToMailingListJob.perform_later(self.user) if self.subscription
    end

    def default_values
      self.subscription ||= true
    end
end
