import mongoose, { Schema, Document } from 'mongoose';
import { IPayroll } from '../types';

const payrollSchema = new Schema<IPayroll>({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  salary: {
    baseSalary: {
      type: Number,
      required: true,
      min: 0
    },
    hourlyRate: {
      type: Number,
      min: 0
    },
    overtimeRate: {
      type: Number,
      min: 0
    }
  },
  hours: {
    regularHours: {
      type: Number,
      default: 0,
      min: 0
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  earnings: {
    regularPay: {
      type: Number,
      default: 0,
      min: 0
    },
    overtimePay: {
      type: Number,
      default: 0,
      min: 0
    },
    bonuses: {
      type: Number,
      default: 0,
      min: 0
    },
    commissions: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  deductions: {
    taxes: {
      federal: {
        type: Number,
        default: 0,
        min: 0
      },
      state: {
        type: Number,
        default: 0,
        min: 0
      },
      local: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    insurance: {
      health: {
        type: Number,
        default: 0,
        min: 0
      },
      dental: {
        type: Number,
        default: 0,
        min: 0
      },
      vision: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    retirement: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDeductions: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  netPay: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['direct-deposit', 'check', 'cash'],
    default: 'direct-deposit'
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
payrollSchema.index({ employee: 1 });
payrollSchema.index({ workspace: 1 });
payrollSchema.index({ 'period.year': 1, 'period.month': 1 });
payrollSchema.index({ status: 1 });

// Method to calculate totals
payrollSchema.methods.calculateTotals = function() {
  // Calculate total hours
  this.hours.totalHours = this.hours.regularHours + this.hours.overtimeHours;
  
  // Calculate earnings
  this.earnings.regularPay = this.hours.regularHours * (this.salary.hourlyRate || 0);
  this.earnings.overtimePay = this.hours.overtimeHours * (this.salary.overtimeRate || 0);
  this.earnings.totalEarnings = this.earnings.regularPay + this.earnings.overtimePay + 
                               this.earnings.bonuses + this.earnings.commissions;
  
  // Calculate total deductions
  this.deductions.totalDeductions = this.deductions.taxes.federal + 
                                   this.deductions.taxes.state + 
                                   this.deductions.taxes.local +
                                   this.deductions.insurance.health +
                                   this.deductions.insurance.dental +
                                   this.deductions.insurance.vision +
                                   this.deductions.retirement +
                                   this.deductions.other;
  
  // Calculate net pay
  this.netPay = this.earnings.totalEarnings - this.deductions.totalDeductions;
  
  return this.save();
};

// Method to approve payroll
payrollSchema.methods.approve = function() {
  this.status = 'approved';
  return this.save();
};

// Method to mark as paid
payrollSchema.methods.markAsPaid = function(paymentDate: Date) {
  this.status = 'paid';
  this.paymentDate = paymentDate;
  return this.save();
};

// Transform JSON output
payrollSchema.methods.toJSON = function() {
  const payrollObject = this.toObject();
  return payrollObject;
};

export default mongoose.model<IPayroll>('Payroll', payrollSchema);
