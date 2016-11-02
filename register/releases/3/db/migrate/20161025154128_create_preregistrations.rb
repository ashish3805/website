class CreatePreregistrations < ActiveRecord::Migration[5.0]
  def change
    create_table :preregistrations do |t|
      t.string :name
      t.string :email
      t.string :domain
      t.boolean :subscription

      t.timestamps
    end
  end
end
