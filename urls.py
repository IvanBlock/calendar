from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^event_calendar/', include('event_calendar.urls')),
    url(r'^admin/', admin.site.urls),
]