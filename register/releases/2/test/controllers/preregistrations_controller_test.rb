require 'test_helper'

class PreregistrationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @preregistration = preregistrations(:one)
  end

  test "should get index" do
    get preregistrations_url
    assert_response :success
  end

  test "should get new" do
    get new_preregistration_url
    assert_response :success
  end

  test "should create preregistration" do
    assert_difference('Preregistration.count') do
      post preregistrations_url, params: { preregistration: { domain: @preregistration.domain, email: @preregistration.email, name: @preregistration.name, subscription: @preregistration.subscription } }
    end

    assert_redirected_to preregistration_url(Preregistration.last)
  end

  test "should show preregistration" do
    get preregistration_url(@preregistration)
    assert_response :success
  end

  test "should get edit" do
    get edit_preregistration_url(@preregistration)
    assert_response :success
  end

  test "should update preregistration" do
    patch preregistration_url(@preregistration), params: { preregistration: { domain: @preregistration.domain, email: @preregistration.email, name: @preregistration.name, subscription: @preregistration.subscription } }
    assert_redirected_to preregistration_url(@preregistration)
  end

  test "should destroy preregistration" do
    assert_difference('Preregistration.count', -1) do
      delete preregistration_url(@preregistration)
    end

    assert_redirected_to preregistrations_url
  end
end
