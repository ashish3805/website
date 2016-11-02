class AddIndexUniqueToEmailOfPreregistrations < ActiveRecord::Migration[5.0]
  def change
    add_index :preregistrations, :email, unique: true
  end
end
