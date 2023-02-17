from django.contrib import admin
from .models import Collection, Spectrum


admin.site.register(Collection)
# admin.site.register(Spectrum)


class SpectrumAdmin(admin.ModelAdmin):
    list_display = ('user','instrument','data_id','latitude','longitude','created_date','permission')
    list_display_links = ('instrument','data_id','latitude','longitude','created_date','permission')

    def user_get(self, obj):
        return obj.user.username
    # user_get.short_description = '著者の年齢'
    # user_get.admin_order_field = 'author__age'

admin.site.register(Spectrum, SpectrumAdmin)