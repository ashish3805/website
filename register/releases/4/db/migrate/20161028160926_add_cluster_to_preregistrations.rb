class AddClusterToPreregistrations < ActiveRecord::Migration[5.0]
  def change
    add_column :preregistrations, :cluster, :string
  end
end
