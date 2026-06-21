from django import forms
from models.models import Webinar

class WebinarForm(forms.ModelForm):
    class Meta:
        model = Webinar
        fields = ['name', 'description', 'title_image',"hosted_at","link",
                  "ticket_expiration","type","price",
                  "stock","category"]