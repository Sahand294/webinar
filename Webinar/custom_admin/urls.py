from django.urls import path
from . import views as v

urlpatterns = [
    # home
    path("",                                    v.main_admin,            name="admin_main"),

    # users
    path("users/",                              v.user,                  name="admin_users"),
    path("users/create/",                       v.create_user,           name="admin_create_user"),
    path("users/<int:id>/edit/",               v.edit_user,             name="admin_edit_user"),
    path("users/<int:id>/delete/",             v.delete_user,           name="admin_delete_user"),

    # webinars
    path("webinars/",                           v.webinar,               name="admin_webinars"),
    path("webinar/<int:id>/activate/",         v.activate_webinar,      name="admin_active_webinar"),
    path("webinar/<int:id>/deactivate/",       v.deactivate_webinar,    name="admin_deactivate_webinar"),

    # subscriptions
    path("subscriptions/",                      v.admin_sub,             name="admin_subscriptions"),
    # path("subscriptions/<int:id>/activate/",   v.activate_subscription, name="admin_activate_subscription"),
    # path("subscriptions/<int:id>/deactivate/", v.deactivate_subscription,name="admin_deactivate_subscription"),
    #
    # # roles
    # path("roles/",                              v.admin_roles,           name="admin_roles"),
    # path("roles/<int:id>/set-participant/",    v.set_participant,       name="admin_set_participant"),
]