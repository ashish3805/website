class AddUniqueIndexToClusterAndDomain < ActiveRecord::Migration[5.0]
  def up
    add_index :preregistrations, [:cluster, :domain], unique: true
  end
end
