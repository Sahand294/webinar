from rest_framework import serializers
from models.models import Webinar

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webinar
        fields = ['name', 'description', 'title_image',"hosted_at","link",
                  "ticket_expiration","type","price",
                  "stock","category"]