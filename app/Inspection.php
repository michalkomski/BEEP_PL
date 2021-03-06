<?php

namespace App;

use Iatstuti\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelLocalization;

use Auth;

class Inspection extends Model
{
    use SoftDeletes, CascadeSoftDeletes;
    protected $cascadeDeletes = ['items'];
    
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'inspections';

    /**
    * The database primary key value.
    *
    * @var string
    */
    protected $primaryKey = 'id';

    /**
     * Attributes that should be mass-assignable.
     *
     * @var array
     */
    protected $fillable = ['notes', 'created_at', 'impression', 'attention', 'reminder', 'reminder_date'];

    protected $hidden   = ['pivot','deleted_at'];

    protected $appends  = ['owner'];

    public $timestamps = false;



    public function getOwnerAttribute()
    {
        if ($this->users()->whereIn('id', [Auth::user()->id])->count() > 0)
            return true;
        
        return false;
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'inspection_user');
    }

    public function hives()
    {
        return $this->belongsToMany(Hive::class, 'inspection_hive');
    }

    public function locations()
    {
        return $this->belongsToMany(Location::class, 'inspection_location');
    }

    public function items()
    {
        return $this->hasMany(InspectionItem::class);
    }
    
    public static function item_names($inspections) // get a locale ordered list of InspectionItem names
    {
        $locale          = LaravelLocalization::getCurrentLocale();
        $inspection_ids  = $inspections->pluck('id')->toArray();
        $inspection_items= InspectionItem::whereIn('inspection_id',$inspection_ids)->groupBy('category_id')->get(); // let the newest id be selected, if multiple on one day
        
        //die(print_r($inspection_cats->toArray()));

        $item_names = [];
        foreach ($inspection_items as $item)
        { 
            $cat_id = $item->category_id;
            $cat = Category::find($cat_id);
            if ($cat->isSystem())
                continue;
            
            $arr = [];
            $set = false;
            //die(print_r($cat->toArray()));
            foreach ($inspections as $d => $inspection) 
            {
                $inspection_items = $inspection->items()->get();//->with('name')->orderBy('name', 'asc')->get();
                $arr[$d] = '';
                //die(print_r($inspection_items->toArray()));
                foreach ($inspection_items as $inspection_item) 
                {
                    if ($inspection_item->category_id == $cat_id)
                    {
                        $arr[$d] = $inspection_item;
                        $set = true;
                        continue;
                    }
                }
            }
            if ($set)
                $item_names[] = ['anc' => $cat->ancName($locale), 'name' => $cat->transName($locale), 'type'=>$cat->input, 'range'=>$cat->inputRange(), 'items' => $arr];

        }

        usort($item_names, function($a,$b){ return strcasecmp($a['anc'].$a['name'], $b['anc'].$b['name']); } );

        //die(print_r($item_names));
        return $item_names;
    }
}
