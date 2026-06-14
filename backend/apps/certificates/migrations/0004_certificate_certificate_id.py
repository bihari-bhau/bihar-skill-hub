import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('certificates', '0003_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='certificate',
            name='certificate_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique ID embedded in QR code for public verification', unique=True),
        ),
    ]
