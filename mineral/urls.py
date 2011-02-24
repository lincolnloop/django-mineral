from django.conf.urls.defaults import patterns, url
from django.views import generic

urlpatterns = patterns('',
    url('^$', generic.TemplateView.as_view(template_name='mineral/index.html'),
        name='index'),
    url('^common/$', generic.TemplateView.as_view(template_name='mineral/common.html'),
        name='common'),
    url('^forms/$', generic.TemplateView.as_view(template_name='mineral/forms.html'),
        name='forms'),
    url('^notifications/$', generic.TemplateView.as_view(template_name='mineral/notifications.html'),
        name='notifications'),
    url('^widgets/$', generic.TemplateView.as_view(template_name='mineral/widgets.html'),
        name='widgets'),
)
