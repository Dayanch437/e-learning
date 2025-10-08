from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract model that provides self-updating 'created_at' and 'updated_at' fields
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Abstract model that provides soft delete functionality
    """
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        """Soft delete the object"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore a soft deleted object"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class BaseModel(TimeStampedModel, SoftDeleteModel):
    """
    Base model that combines timestamp and soft delete functionality
    """
    class Meta:
        abstract = True
