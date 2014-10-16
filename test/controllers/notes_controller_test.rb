require 'test_helper'

class NotesControllerTest < ActionController::TestCase
  test "should get home" do
    get :index
    assert_response :success
  end
  # test "the truth" do
  #   assert true
  # end
end
