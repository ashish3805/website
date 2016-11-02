class PreregistrationsController < ApplicationController
  before_action :set_preregistration, only: [:show, :edit, :update, :destroy]

  # GET /preregistrations
  # GET /preregistrations.json
  def index
    @preregistrations = Preregistration.all
  end

  # GET /preregistrations/1
  # GET /preregistrations/1.json
  def show
  end

  # GET /preregistrations/new
  def new
    @preregistration = Preregistration.new
  end

  # GET /preregistrations/1/edit
  def edit
  end

  # POST /preregistrations
  # POST /preregistrations.json
  def create
    @preregistration = Preregistration.new(preregistration_params)    

    respond_to do |format|
      if @preregistration.save
        format.html { redirect_to :back, notice: 'Preregistration was successfully created.' }
        format.json { render :show, status: :created, location: @preregistration }
      else
        format.html { render 'welcome/index' }
        format.json { render json: @preregistration.errors, status: :unprocessable_entity, anchor: "register" }
      end
    end
  end

  # PATCH/PUT /preregistrations/1
  # PATCH/PUT /preregistrations/1.json
  def update
    respond_to do |format|
      if @preregistration.update(preregistration_params)
        format.html { redirect_to @preregistration, notice: 'Preregistration was successfully updated.' }
        format.json { render :show, status: :ok, location: @preregistration }
      else
        format.html { render :edit }
        format.json { render json: @preregistration.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /preregistrations/1
  # DELETE /preregistrations/1.json
  def destroy
    @preregistration.destroy
    respond_to do |format|
      format.html { redirect_to preregistrations_url, notice: 'Preregistration was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_preregistration
      @preregistration = Preregistration.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def preregistration_params
      params.require(:preregistration).permit(:name, :email, :domain, :subscription, :cluster)
    end
end
