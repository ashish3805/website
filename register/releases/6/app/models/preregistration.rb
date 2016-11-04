class Preregistration < ApplicationRecord
  after_initialize :default_values
  after_create :subscribe_user_to_mailing_list
  enum cluster: [:home, :wallet, :users, :music, :watch, :learn, :show, :pblic]
  validates :cluster, inclusion: { in: clusters.keys }  
  validates :domain, exclusion: { in: ['yahoo', 'google', 'facebook', 'ebay', 'msn', 'live', 'myspace', 'aol', 'wikipedia', 'microsoft', 'youtube', 'amazon', 'blogger', 'craigslist', 'flickr', 'cnn', 'walmart', 'bankofamerica', 'monster', 'paypal', 'digg', 'netflix', 'apple', 'expedia', 'webmd', 'wordpress', 'instagram', 'pinterest', 'tumblr', 'vimeo', 'godaddy', 'baidu', 'w3', 'reddit', 'bbc', 'cnn', 'theguardian', 'imdb', 'github', 'huffingtonpost', 'forbes', 'dropbox', 'amazonaws', 'washingtonpost', 'etsy', 'telegraph', 'reuters', 'bing', 'joomla', 'wikimedia', 'time', 'spotify', 'theatlantic', 'medium', 'skype', 'nebulis', 'pax', 'kraken', 'shapeshift', 'bitcoin', 'ethereum', 'monero', 'zcash', 'cointelegraph'] }
  validates :domain, length: { maximum: 16 }
  validates :domain, uniqueness: { scope: :cluster }
  validates :email, uniqueness: true 
#maybe this will work to remove /
  def self.get_clusters
    self.clusters.map do |k,v|
      if k == "pblic" then
        { "public" => k }
      else
        { "#{k.to_s}" => k }
      end
    end.reduce(:merge)
  end

  private
    def subscribe_user_to_mailing_list
      SubscribeUserToMailingListJob.perform_later(self.email) if self.subscription
    end

    def default_values
      self.subscription ||= true
    end
end
