class Preregistration < ApplicationRecord
  after_initialize :default_values
  validates :email, uniqueness: true

  private
    def default_values
      self.subscription ||= true
    end
end
